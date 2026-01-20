// Debug Script - Run in Browser Console (F12)
// Copy-paste this entire script into the console at http://localhost:3000

console.clear();
console.log('🔍 Design Debug Script - Starting...\n');

// 1. Check if custom CSS classes exist
const testDiv = document.createElement('div');
testDiv.className = 'text-11 text-12 text-13 w-2px';
document.body.appendChild(testDiv);

const computed11 = window.getComputedStyle(testDiv);
console.log('✅ CSS Classes Test:');
console.log('   text-11 font-size:', computed11.fontSize);
console.log('   Expected: 11px or 0.6875rem (11px)');

// 2. Check timeline elements
const timeline = document.querySelector('[class*="Timeline"]') || document.querySelector('.timeline');
if (timeline) {
  console.log('\n✅ Timeline found:', timeline);
  
  // Find ruler text
  const rulerTexts = Array.from(document.querySelectorAll('.text-12')).filter(el => 
    el.textContent.match(/\d+:\d+:\d+/)
  );
  if (rulerTexts.length > 0) {
    const rulerStyle = window.getComputedStyle(rulerTexts[0]);
    console.log('   Ruler text font-size:', rulerStyle.fontSize);
    console.log('   Expected: 12px');
  }
} else {
  console.log('\n❌ Timeline not found - is Editor view open?');
}

// 3. Check which view is active
const isDashboard = document.querySelector('[class*="Dashboard"]') !== null;
const isEditor = document.querySelector('[class*="Editor"]') !== null;

console.log('\n📍 Current View:');
console.log('   Dashboard:', isDashboard ? '✅ ACTIVE' : '❌');
console.log('   Editor:', isEditor ? '✅ ACTIVE' : '❌');

// 4. Check all loaded stylesheets
console.log('\n📄 Loaded Stylesheets:');
Array.from(document.styleSheets).forEach((sheet, i) => {
  try {
    const rules = Array.from(sheet.cssRules || []);
    const customRules = rules.filter(r => 
      r.selectorText && (
        r.selectorText.includes('.text-11') ||
        r.selectorText.includes('.text-12') ||
        r.selectorText.includes('.text-13') ||
        r.selectorText.includes('.w-2px')
      )
    );
    
    if (customRules.length > 0) {
      console.log(`   ✅ Stylesheet ${i}: ${sheet.href || 'inline'}`);
      customRules.forEach(rule => {
        console.log(`      ${rule.selectorText} { ${rule.style.fontSize || rule.style.width} }`);
      });
    }
  } catch (e) {
    console.log(`   ⚠️  Stylesheet ${i}: ${sheet.href || 'inline'} (CORS blocked)`);
  }
});

// 5. Find all elements using custom classes
console.log('\n🎯 Elements using custom classes:');
['text-11', 'text-12', 'text-13', 'w-2px'].forEach(className => {
  const elements = document.querySelectorAll(`.${className}`);
  console.log(`   .${className}: ${elements.length} elements found`);
  if (elements.length > 0 && elements.length < 5) {
    elements.forEach((el, i) => {
      console.log(`      [${i}]:`, el.textContent.substring(0, 50) + '...');
    });
  }
});

// 6. Check Electron vs Browser
const isElectron = navigator.userAgent.includes('Electron');
console.log('\n🖥️  Environment:');
console.log('   Running in:', isElectron ? 'Electron' : 'Browser');
console.log('   User Agent:', navigator.userAgent);

// Cleanup
testDiv.remove();

console.log('\n✅ Debug script complete!');
console.log('📋 Summary:');
console.log('   1. Open Editor view (click on a project)');
console.log('   2. Inspect timeline elements with DevTools');
console.log('   3. Check computed styles (font-size should be 11-13px)');
