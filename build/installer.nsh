; Custom NSIS installer script
!macro customInstall
  ; Add FFmpeg to installation
  File /r "${BUILD_RESOURCES_DIR}\ffmpeg\*.*"
  
  ; Create file associations
  WriteRegStr HKCR ".veproj" "" "VideoEditorProject"
  WriteRegStr HKCR "VideoEditorProject" "" "Video Editor Project"
  WriteRegStr HKCR "VideoEditorProject\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "VideoEditorProject\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
!macroend

!macro customUnInstall
  ; Remove file associations
  DeleteRegKey HKCR ".veproj"
  DeleteRegKey HKCR "VideoEditorProject"
!macroend
