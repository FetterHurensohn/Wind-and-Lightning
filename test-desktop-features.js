// Desktop Features Test Script
// Füge diesen Code in die Browser-Konsole ein, um alle Features zu testen

console.log('🧪 Starting Desktop Features Test...\n');

// Test 1: Check if running in Electron
console.log('📌 Test 1: Electron Environment');
if (window.electronAPI && window.electronAPI.isElectron) {
  console.log('✅ Running in Electron');
  console.log('   Platform:', window.electronAPI.platform);
} else {
  console.log('⚠️  Running in Browser (limited features)');
}
console.log('');

// Test 2: Cache System
console.log('📌 Test 2: Frame Cache System');
(async () => {
  try {
    // Test saving a frame
    const testDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const saveResult = await window.electronAPI.cache.saveFrame('test-clip', 0, testDataURL);
    
    if (saveResult.success) {
      console.log('✅ Frame cache save successful');
      
      // Test loading a frame
      const loadResult = await window.electronAPI.cache.loadFrame('test-clip', 0);
      if (loadResult.success) {
        console.log('✅ Frame cache load successful');
      } else {
        console.log('❌ Frame cache load failed:', loadResult.error);
      }
    } else {
      console.log('❌ Frame cache save failed:', saveResult.error);
    }
  } catch (error) {
    console.log('❌ Cache system error:', error.message);
  }
  console.log('');
  
  // Test 3: Project Save/Load
  console.log('📌 Test 3: Project Save');
  try {
    const testProject = {
      projectName: 'Test Project',
      fps: 30,
      duration: 60,
      tracks: [],
      media: []
    };
    
    const result = await window.electronAPI.project.save(testProject);
    if (result.success) {
      console.log('✅ Project save successful');
      if (result.path) {
        console.log('   Path:', result.path);
      }
    } else {
      console.log('❌ Project save failed');
    }
  } catch (error) {
    console.log('❌ Project save error:', error.message);
  }
  console.log('');
  
  // Test 4: Dialog (File Open)
  console.log('📌 Test 4: Native File Dialog');
  console.log('⏸️  Skipped (requires user interaction)');
  console.log('   To test: Use Ctrl+O or File > Open menu');
  console.log('');
  
  // Test 5: System Info
  console.log('📌 Test 5: System Information');
  try {
    const info = await window.electronAPI.system.getInfo();
    console.log('✅ System info retrieved:');
    console.log('   Platform:', info.platform);
    console.log('   Arch:', info.arch);
    console.log('   Home Directory:', info.homeDir);
  } catch (error) {
    console.log('❌ System info error:', error.message);
  }
  console.log('');
  
  // Test 6: Cache Directory
  console.log('📌 Test 6: Cache Directory');
  try {
    const cachePath = await window.electronAPI.system.getPath('cache');
    if (cachePath) {
      console.log('✅ Cache path:', cachePath);
    } else {
      console.log('⚠️  Cache path not available');
    }
  } catch (error) {
    console.log('❌ Cache path error:', error.message);
  }
  console.log('');
  
  // Summary
  console.log('========================================');
  console.log('📊 Test Summary:');
  console.log('✅ = Passed | ❌ = Failed | ⏸️ = Skipped | ⚠️ = Warning');
  console.log('========================================');
  console.log('');
  console.log('🎯 Manual Tests to perform:');
  console.log('1. File > New Project (Ctrl+N)');
  console.log('2. File > Open Project (Ctrl+O)');
  console.log('3. File > Save Project (Ctrl+S)');
  console.log('4. File > Import Media (Ctrl+I)');
  console.log('5. File > Export (Ctrl+E)');
  console.log('6. Edit > Undo (Ctrl+Z)');
  console.log('7. Edit > Redo (Ctrl+Shift+Z)');
  console.log('8. Edit > Split (Ctrl+K)');
  console.log('9. View > Zoom In (Ctrl++)');
  console.log('10. View > Zoom Out (Ctrl+-)');
})();
