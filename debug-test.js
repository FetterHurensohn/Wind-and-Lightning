// Test script for debugging Video Editor functions
// Run this in Browser Console (F12)

console.log('🔍 Video Editor Debug Test');
console.log('========================\n');

// 1. Check Redux Store
console.log('1️⃣ Testing Redux Store...');
const state = window.store?.getState();
if (state) {
  console.log('✅ Redux Store accessible');
  console.log('Media Items:', state.media?.items?.length || 0);
  console.log('Timeline Clips:', state.timeline?.clips?.length || 0);
  console.log('Tracks:', state.timeline?.tracks?.length || 0);
} else {
  console.error('❌ Redux Store not accessible');
}

// 2. Check if clips are on timeline
console.log('\n2️⃣ Testing Timeline Clips...');
if (state?.timeline?.clips?.length > 0) {
  console.log('✅ Clips found on timeline');
  state.timeline.clips.forEach((clip, i) => {
    console.log(`  Clip ${i + 1}:`, {
      id: clip.id,
      mediaId: clip.mediaId,
      trackId: clip.trackId,
      startTime: clip.startTime,
      duration: clip.duration
    });
  });
} else {
  console.warn('⚠️ No clips on timeline');
  console.log('Try: Double-click a media item to add it to timeline');
}

// 3. Check if media has proper URLs
console.log('\n3️⃣ Testing Media URLs...');
if (state?.media?.items?.length > 0) {
  console.log('✅ Media items found');
  state.media.items.forEach((item, i) => {
    console.log(`  Media ${i + 1}:`, {
      name: item.name,
      type: item.type,
      hasURL: !!item.url,
      hasFile: !!item.file,
      duration: item.duration
    });
  });
} else {
  console.warn('⚠️ No media items');
  console.log('Try: Click "Import Media" to add files');
}

// 4. Test Video Preview Element
console.log('\n4️⃣ Testing Video Preview...');
const videoElement = document.querySelector('.preview-video');
if (videoElement) {
  console.log('✅ Video element found');
  console.log('  Source:', videoElement.src || 'No source');
  console.log('  Current Time:', videoElement.currentTime);
  console.log('  Duration:', videoElement.duration);
} else {
  console.warn('⚠️ Video element not found');
}

// 5. Test Timeline Element
console.log('\n5️⃣ Testing Timeline...');
const timelineClips = document.querySelectorAll('.timeline-clip');
if (timelineClips.length > 0) {
  console.log(`✅ ${timelineClips.length} clip(s) rendered on timeline`);
} else {
  console.warn('⚠️ No clips rendered on timeline');
}

// 6. Test Play/Pause
console.log('\n6️⃣ Testing Playback...');
console.log('Current Time:', state?.timeline?.currentTime || 0);
console.log('Is Playing:', state?.timeline?.isPlaying || false);
console.log('Duration:', state?.timeline?.duration || 0);

console.log('\n========================');
console.log('🏁 Debug Test Complete');
console.log('\nTo fix issues, check:');
console.log('1. Import media files first');
console.log('2. Double-click media to add to timeline');
console.log('3. Check Browser Console for errors');
