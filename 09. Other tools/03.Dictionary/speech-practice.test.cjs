const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(__dirname + '/speech-practice.js', 'utf8');
let count = 0;
function fixture(options = {}) {
  const instances = [], events = {}, timers = new Map();
  const button = { attributes: {}, setAttribute(k,v) { this.attributes[k]=v; }, addEventListener(k,v) { this[k]=v; } };
  const feedback = { dataset: {} };
  let target = { word: 'hello', language: 'en', locale: 'en-GB', ...options.target };
  class Recognition {
    constructor() { instances.push(this); }
    start() { if(options.throws) throw new Error('start failed'); this.onstart(); }
    abort() { this.aborted = true; this.onend?.(); }
  }
  const document = { addEventListener(k,v) { events[k]=v; } };
  const window = { isSecureContext: options.secure !== false, addEventListener(k,v) { events[k]=v; } };
  if (!options.unsupported) window[options.prefixed ? 'webkitSpeechRecognition' : 'SpeechRecognition'] = Recognition;
  let before = 0;
  const context = vm.createContext({window, document, setTimeout(fn) { const id=timers.size+1;timers.set(id,fn);return id; },clearTimeout(id) {timers.delete(id);} });
  vm.runInContext(source, context);
  const controller = context.createSpeechPractice({button,feedback,getTarget:()=>target,beforeStart:()=>before++});
  return { button,feedback,instances,controller,events,document,timers,get before() {return before;} };
}
function result(r, text, final = true) { r.onresult({resultIndex:0,results:[Object.assign([{transcript:text}],{isFinal:final})]}); }
function test(name, fn) { fn(); count++; console.log('PASS '+name); }
test('prefixed API, locale, transcript punctuation, successful result survives end',()=> {
 const f=fixture({prefixed:true}); f.button.click(); const r=f.instances[0]; assert.equal(r.lang,'en-GB'); assert.equal(f.before,1); result(r,'Hello!'); assert.equal(f.feedback.dataset.state,'match'); r.onend(); assert.equal(f.feedback.dataset.state,'match'); assert.equal(f.button.attributes['aria-pressed'],'false'); assert.equal(f.timers.size,0);
});
test('wrong word does not match',()=>{const f=fixture();f.button.click();result(f.instances[0],'yellow');assert.equal(f.feedback.dataset.state,'mismatch');});
test('ignore interim result',()=>{const f=fixture();f.button.click();result(f.instances[0],'hello',false);assert.equal(f.button.attributes['aria-pressed'],'true');});
test('alternatives and parenthetical notes',()=>{const f=fixture({target:{word:'hello (greeting) / hi; hey'}});f.button.click();result(f.instances[0],'Hi.');assert.equal(f.feedback.dataset.state,'match');});
test('diacritics are not discarded and off TTS uses language locale',()=>{const f=fixture({target:{word:'schön',language:'de',locale:'off'}});f.button.click();assert.equal(f.instances[0].lang,'de-DE');result(f.instances[0],'schon');assert.equal(f.feedback.dataset.state,'mismatch');});
test('apostrophe normalization',()=>{const f=fixture({target:{word:'don’t'}});f.button.click();result(f.instances[0],"don't");assert.equal(f.feedback.dataset.state,'match');});
test('cancel and retry ignore old network result',()=>{const f=fixture();f.button.click();const old=f.instances[0];f.button.click();f.button.click();result(old,'hello');assert.equal(f.button.attributes['aria-pressed'],'true');result(f.instances[1],'hello');assert.equal(f.feedback.dataset.state,'match');});
test('card reset invalidates result',()=>{const f=fixture();f.button.click();const old=f.instances[0];f.controller.cancel();result(old,'hello');assert.equal(f.feedback.dataset.state,'idle');assert.equal(old.aborted,true);});
for(const error of ['not-allowed','audio-capture','network','no-speech','language-not-supported','service-not-allowed']) {
 test('recover from '+error,()=>{const f=fixture();f.button.click();f.instances[0].onerror({error});assert.equal(f.feedback.dataset.state,'error');assert.equal(f.button.attributes['aria-pressed'],'false');assert.equal(f.timers.size,0);f.button.click();assert.equal(f.instances.length,2);});
}
test('no result and timeout release recording',()=>{const f=fixture();f.button.click();f.instances[0].onend();assert.equal(f.feedback.dataset.state,'error');f.button.click();[...f.timers.values()][0]();assert.equal(f.feedback.dataset.state,'error');assert.equal(f.instances[1].aborted,true);});
test('hidden page aborts',()=>{const f=fixture();f.button.click();f.document.hidden=true;f.events.visibilitychange();assert.equal(f.instances[0].aborted,true);});
test('unsupported or insecure context disables button',()=>{for(const opts of [{unsupported:true},{secure:false}]) {const f=fixture(opts);assert.equal(f.button.disabled,true);f.button.click();assert.equal(f.instances.length,0);}});
test('synchronous start failure resets state',()=>{const f=fixture({throws:true});f.button.click();assert.equal(f.feedback.dataset.state,'error');assert.equal(f.button.attributes['aria-pressed'],'false');assert.equal(f.timers.size,0);});
console.log(`${count} tests passed`);
