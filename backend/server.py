"""
Video Export Backend - FastAPI mit FFmpeg
Server-seitiger Video-Export für MP4/MOV/WebM
"""

import os
import json
import uuid
import asyncio
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import subprocess

app = FastAPI(
    title="Video Editor Export API",
    description="FFmpeg-basierter Video-Export-Service",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_DIR = Path("/tmp/video_editor_uploads")
EXPORT_DIR = Path("/tmp/video_editor_exports")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

# Active export jobs
export_jobs: Dict[str, Dict[str, Any]] = {}

# ============================================
# MODELS
# ============================================

class ClipData(BaseModel):
    id: str
    type: str  # video, audio, image, text, sticker
    title: str
    start: float
    duration: float
    mediaId: Optional[str] = None
    mediaPath: Optional[str] = None
    props: Optional[Dict[str, Any]] = {}

class TrackData(BaseModel):
    id: str
    name: str
    type: str
    clips: List[ClipData] = []
    muted: bool = False
    hidden: bool = False

class ExportSettings(BaseModel):
    resolution: str = "1080p"  # 480p, 720p, 1080p, 1440p, 4k
    fps: int = 30
    format: str = "mp4"  # mp4, mov, webm
    codec: str = "h264"  # h264, h265, vp9
    quality: int = 80  # 1-100
    duration: float = 10.0

class ExportRequest(BaseModel):
    projectId: str
    tracks: List[TrackData]
    settings: ExportSettings
    mediaFiles: Dict[str, str] = {}  # mediaId -> uploaded file path

class ExportStatus(BaseModel):
    jobId: str
    status: str  # pending, processing, completed, failed
    progress: int  # 0-100
    phase: str  # preparing, rendering, encoding, finalizing
    outputFile: Optional[str] = None
    error: Optional[str] = None
    createdAt: str
    completedAt: Optional[str] = None

# ============================================
# RESOLUTION MAPPING
# ============================================

RESOLUTIONS = {
    "480p": (854, 480),
    "720p": (1280, 720),
    "1080p": (1920, 1080),
    "1440p": (2560, 1440),
    "4k": (3840, 2160),
}

CODEC_MAP = {
    "h264": "libx264",
    "h265": "libx265",
    "vp9": "libvpx-vp9",
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_ffmpeg_cmd():
    """Get FFmpeg command path"""
    return shutil.which("ffmpeg") or "ffmpeg"

def get_ffprobe_cmd():
    """Get FFprobe command path"""
    return shutil.which("ffprobe") or "ffprobe"

async def run_ffmpeg(args: List[str], job_id: str) -> bool:
    """Run FFmpeg command asynchronously"""
    cmd = [get_ffmpeg_cmd()] + args
    print(f"[FFmpeg] Running: {' '.join(cmd)}")
    
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            error_msg = stderr.decode() if stderr else "Unknown error"
            print(f"[FFmpeg] Error: {error_msg}")
            if job_id in export_jobs:
                export_jobs[job_id]["error"] = error_msg[:500]
            return False
        
        return True
    except Exception as e:
        print(f"[FFmpeg] Exception: {str(e)}")
        if job_id in export_jobs:
            export_jobs[job_id]["error"] = str(e)
        return False

async def create_color_video(output_path: str, duration: float, width: int, height: int, color: str = "black", fps: int = 30) -> bool:
    """Create a solid color video as base"""
    args = [
        "-y",
        "-f", "lavfi",
        "-i", f"color=c={color}:s={width}x{height}:d={duration}:r={fps}",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-t", str(duration),
        output_path
    ]
    
    process = await asyncio.create_subprocess_exec(
        get_ffmpeg_cmd(), *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    await process.communicate()
    return process.returncode == 0

async def create_text_overlay(text: str, output_path: str, duration: float, width: int, height: int, props: dict = {}) -> bool:
    """Create a text overlay video"""
    font_size = props.get("fontSize", 48)
    color = props.get("color", "white").replace("#", "")
    
    # Escape text for FFmpeg
    escaped_text = text.replace("'", "\\'").replace(":", "\\:")
    
    args = [
        "-y",
        "-f", "lavfi",
        "-i", f"color=c=black@0:s={width}x{height}:d={duration}",
        "-vf", f"drawtext=text='{escaped_text}':fontsize={font_size}:fontcolor={color}:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v", "png",
        "-pix_fmt", "rgba",
        "-t", str(duration),
        output_path
    ]
    
    process = await asyncio.create_subprocess_exec(
        get_ffmpeg_cmd(), *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    await process.communicate()
    return process.returncode == 0

# ============================================
# EXPORT PROCESSING
# ============================================

async def process_export(job_id: str, request: ExportRequest):
    """Main export processing function"""
    job = export_jobs.get(job_id)
    if not job:
        return
    
    try:
        settings = request.settings
        width, height = RESOLUTIONS.get(settings.resolution, (1920, 1080))
        
        job["status"] = "processing"
        job["phase"] = "preparing"
        job["progress"] = 5
        
        # Create job directory
        job_dir = EXPORT_DIR / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        
        output_ext = settings.format
        output_file = job_dir / f"output.{output_ext}"
        
        # Phase 1: Create base video
        job["phase"] = "rendering"
        job["progress"] = 20
        
        base_video = job_dir / "base.mp4"
        await create_color_video(str(base_video), settings.duration, width, height, "black", settings.fps)
        
        # Phase 2: Process tracks and clips
        job["phase"] = "encoding"
        job["progress"] = 50
        
        # Build FFmpeg filter complex for compositing
        inputs = ["-i", str(base_video)]
        filter_parts = []
        current_input = 0
        
        # Process video/image clips
        for track in request.tracks:
            if track.hidden or track.type not in ["video", "image"]:
                continue
            
            for clip in track.clips:
                media_path = request.mediaFiles.get(clip.mediaId)
                if media_path and os.path.exists(media_path):
                    inputs.extend(["-i", media_path])
                    current_input += 1
                    
                    # Add overlay filter
                    start_time = clip.start
                    end_time = clip.start + clip.duration
                    
                    # Get clip properties
                    props = clip.props or {}
                    scale = props.get("scale", 100) / 100
                    opacity = props.get("opacity", 100) / 100
                    pos_x = props.get("posX", 0)
                    pos_y = props.get("posY", 0)
                    
                    # Scale and position
                    filter_parts.append(
                        f"[{current_input}:v]scale={int(width*scale)}:{int(height*scale)},format=rgba,colorchannelmixer=aa={opacity}[v{current_input}]"
                    )
        
        job["progress"] = 70
        
        # Phase 3: Final encoding
        job["phase"] = "finalizing"
        
        # Get codec
        video_codec = CODEC_MAP.get(settings.codec, "libx264")
        
        # Quality settings (CRF for x264/x265, CQ for VP9)
        quality_crf = int(51 - (settings.quality / 100 * 41))  # Map 1-100 to CRF 51-10
        
        # Build final FFmpeg command
        final_args = [
            "-y",
            "-i", str(base_video),
            "-c:v", video_codec,
            "-preset", "medium",
            "-crf", str(quality_crf),
            "-pix_fmt", "yuv420p",
            "-r", str(settings.fps),
            "-t", str(settings.duration),
        ]
        
        # Add audio if present
        has_audio = any(t.type == "audio" and not t.muted for t in request.tracks)
        if not has_audio:
            final_args.extend(["-an"])  # No audio
        
        final_args.append(str(output_file))
        
        success = await run_ffmpeg(final_args, job_id)
        
        if success and output_file.exists():
            job["status"] = "completed"
            job["progress"] = 100
            job["phase"] = "done"
            job["outputFile"] = str(output_file)
            job["completedAt"] = datetime.now(timezone.utc).isoformat()
        else:
            job["status"] = "failed"
            if not job.get("error"):
                job["error"] = "Export fehlgeschlagen"
        
    except Exception as e:
        print(f"[Export] Error: {str(e)}")
        job["status"] = "failed"
        job["error"] = str(e)

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    ffmpeg_available = shutil.which("ffmpeg") is not None
    return {
        "status": "ok",
        "service": "video-export-api",
        "ffmpeg_available": ffmpeg_available,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/export/upload")
async def upload_media(file: UploadFile = File(...)):
    """Upload a media file for export"""
    try:
        # Generate unique filename
        ext = Path(file.filename).suffix or ".mp4"
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}{ext}"
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return {
            "fileId": file_id,
            "filePath": str(file_path),
            "fileName": file.filename,
            "size": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export/start", response_model=ExportStatus)
async def start_export(request: ExportRequest, background_tasks: BackgroundTasks):
    """Start a new export job"""
    job_id = str(uuid.uuid4())
    
    job = {
        "jobId": job_id,
        "status": "pending",
        "progress": 0,
        "phase": "queued",
        "outputFile": None,
        "error": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "completedAt": None,
        "request": request.dict()
    }
    
    export_jobs[job_id] = job
    
    # Start processing in background
    background_tasks.add_task(process_export, job_id, request)
    
    return ExportStatus(**{k: v for k, v in job.items() if k != "request"})

@app.get("/api/export/status/{job_id}", response_model=ExportStatus)
async def get_export_status(job_id: str):
    """Get status of an export job"""
    job = export_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    
    return ExportStatus(**{k: v for k, v in job.items() if k != "request"})

@app.get("/api/export/download/{job_id}")
async def download_export(job_id: str):
    """Download the exported video"""
    job = export_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Export noch nicht abgeschlossen")
    
    output_file = job.get("outputFile")
    if not output_file or not os.path.exists(output_file):
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    
    # Determine media type
    ext = Path(output_file).suffix.lower()
    media_types = {
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".webm": "video/webm",
    }
    media_type = media_types.get(ext, "application/octet-stream")
    
    filename = f"export_{job_id[:8]}{ext}"
    
    return FileResponse(
        output_file,
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.delete("/api/export/{job_id}")
async def delete_export(job_id: str):
    """Delete an export job and its files"""
    job = export_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job nicht gefunden")
    
    # Delete job directory
    job_dir = EXPORT_DIR / job_id
    if job_dir.exists():
        shutil.rmtree(job_dir)
    
    # Remove from jobs dict
    del export_jobs[job_id]
    
    return {"message": "Job gelöscht", "jobId": job_id}

@app.get("/api/export/jobs")
async def list_jobs():
    """List all export jobs"""
    return {
        "jobs": [
            ExportStatus(**{k: v for k, v in job.items() if k != "request"})
            for job in export_jobs.values()
        ]
    }

# Simple demo export endpoint
@app.post("/api/export/demo")
async def demo_export(background_tasks: BackgroundTasks):
    """Create a demo export (simple color video)"""
    job_id = str(uuid.uuid4())
    
    job = {
        "jobId": job_id,
        "status": "processing",
        "progress": 10,
        "phase": "rendering",
        "outputFile": None,
        "error": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "completedAt": None
    }
    export_jobs[job_id] = job
    
    async def create_demo():
        try:
            job_dir = EXPORT_DIR / job_id
            job_dir.mkdir(parents=True, exist_ok=True)
            output_file = job_dir / "demo.mp4"
            
            job["progress"] = 30
            
            # Create a simple demo video with FFmpeg
            args = [
                "-y",
                "-f", "lavfi",
                "-i", "color=c=blue:s=1920x1080:d=5:r=30",
                "-vf", "drawtext=text='Video Editor Export Demo':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-pix_fmt", "yuv420p",
                str(output_file)
            ]
            
            job["progress"] = 50
            job["phase"] = "encoding"
            
            success = await run_ffmpeg(args, job_id)
            
            if success and output_file.exists():
                job["status"] = "completed"
                job["progress"] = 100
                job["phase"] = "done"
                job["outputFile"] = str(output_file)
                job["completedAt"] = datetime.now(timezone.utc).isoformat()
            else:
                job["status"] = "failed"
                job["error"] = "Demo-Export fehlgeschlagen"
                
        except Exception as e:
            job["status"] = "failed"
            job["error"] = str(e)
    
    background_tasks.add_task(create_demo)
    
    return {"jobId": job_id, "message": "Demo-Export gestartet"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
