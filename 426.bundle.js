(()=>{"use strict";var n={152:(n,e,t)=>{let r;t.d(e,{ZP:()=>T,dQ:()=>S,mT:()=>v}),n=t.hmd(n);const o=new Array(32).fill(void 0);function i(n){return o[n]}o.push(void 0,null,!0,!1);let _=o.length;function c(n){const e=i(n);return function(n){n<36||(o[n]=_,_=n)}(n),e}const u=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});u.decode();let a=new Uint8Array;function b(){return 0===a.byteLength&&(a=new Uint8Array(r.memory.buffer)),a}function f(n,e){return u.decode(b().subarray(n,n+e))}function s(n){_===o.length&&o.push(o.length+1);const e=_;return _=o[e],o[e]=n,e}let g=0;const w=new TextEncoder("utf-8"),l="function"==typeof w.encodeInto?function(n,e){return w.encodeInto(n,e)}:function(n,e){const t=w.encode(n);return e.set(t),{read:n.length,written:t.length}};function d(n,e,t){if(void 0===t){const t=w.encode(n),r=e(t.length);return b().subarray(r,r+t.length).set(t),g=t.length,r}let r=n.length,o=e(r);const i=b();let _=0;for(;_<r;_++){const e=n.charCodeAt(_);if(e>127)break;i[o+_]=e}if(_!==r){0!==_&&(n=n.slice(_)),o=t(o,r,r=_+3*n.length);const e=b().subarray(o+_,o+r);_+=l(n,e).written}return g=_,o}function y(n){return null==n}let p=new Int32Array;function m(){return 0===p.byteLength&&(p=new Int32Array(r.memory.buffer)),p}let h=new Float64Array;function A(n){const e=typeof n;if("number"==e||"boolean"==e||null==n)return`${n}`;if("string"==e)return`"${n}"`;if("symbol"==e){const e=n.description;return null==e?"Symbol":`Symbol(${e})`}if("function"==e){const e=n.name;return"string"==typeof e&&e.length>0?`Function(${e})`:"Function"}if(Array.isArray(n)){const e=n.length;let t="[";e>0&&(t+=A(n[0]));for(let r=1;r<e;r++)t+=", "+A(n[r]);return t+="]",t}const t=/\[object ([^\]]+)\]/.exec(toString.call(n));let r;if(!(t.length>1))return toString.call(n);if(r=t[1],"Object"==r)try{return"Object("+JSON.stringify(n)+")"}catch(n){return"Object"}return n instanceof Error?`${n.name}: ${n.message}\n${n.stack}`:r}function v(n,e,t,o){try{const u=r.__wbindgen_add_to_stack_pointer(-16),a=d(n,r.__wbindgen_malloc,r.__wbindgen_realloc),b=g;r.simulate_elections(u,a,b,e,t,s(o));var i=m()[u/4+0],_=m()[u/4+1];if(m()[u/4+2])throw c(_);return c(i)}finally{r.__wbindgen_add_to_stack_pointer(16)}}function S(n,e,t,o,i,_){try{const b=r.__wbindgen_add_to_stack_pointer(-16),f=d(n,r.__wbindgen_malloc,r.__wbindgen_realloc),w=g;r.simulate_single_election(b,f,w,e,t,s(o),i,_);var u=m()[b/4+0],a=m()[b/4+1];if(m()[b/4+2])throw c(a);return c(u)}finally{r.__wbindgen_add_to_stack_pointer(16)}}function x(n,e){try{return n.apply(this,e)}catch(n){r.__wbindgen_exn_store(s(n))}}function j(n,e){return b().subarray(n/1,n/1+e)}function O(){const e={wbg:{}};return e.wbg.__wbindgen_object_drop_ref=function(n){c(n)},e.wbg.__wbindgen_error_new=function(n,e){return s(new Error(f(n,e)))},e.wbg.__wbindgen_string_get=function(n,e){const t=i(e),o="string"==typeof t?t:void 0;var _=y(o)?0:d(o,r.__wbindgen_malloc,r.__wbindgen_realloc),c=g;m()[n/4+1]=c,m()[n/4+0]=_},e.wbg.__wbindgen_is_object=function(n){const e=i(n);return"object"==typeof e&&null!==e},e.wbg.__wbindgen_is_undefined=function(n){return void 0===i(n)},e.wbg.__wbindgen_in=function(n,e){return i(n)in i(e)},e.wbg.__wbindgen_number_get=function(n,e){const t=i(e),o="number"==typeof t?t:void 0;(0===h.byteLength&&(h=new Float64Array(r.memory.buffer)),h)[n/8+1]=y(o)?0:o,m()[n/4+0]=!y(o)},e.wbg.__wbindgen_number_new=function(n){return s(n)},e.wbg.__wbindgen_bigint_from_u64=function(n){return s(BigInt.asUintN(64,n))},e.wbg.__wbindgen_object_clone_ref=function(n){return s(i(n))},e.wbg.__wbindgen_string_new=function(n,e){return s(f(n,e))},e.wbg.__wbindgen_jsval_loose_eq=function(n,e){return i(n)==i(e)},e.wbg.__wbindgen_boolean_get=function(n){const e=i(n);return"boolean"==typeof e?e?1:0:2},e.wbg.__wbg_String_91fba7ded13ba54c=function(n,e){const t=d(String(i(e)),r.__wbindgen_malloc,r.__wbindgen_realloc),o=g;m()[n/4+1]=o,m()[n/4+0]=t},e.wbg.__wbg_getwithrefkey_15c62c2b8546208d=function(n,e){return s(i(n)[i(e)])},e.wbg.__wbg_set_20cbc34131e76824=function(n,e,t){i(n)[c(e)]=c(t)},e.wbg.__wbg_crypto_e1d53a1d73fb10b8=function(n){return s(i(n).crypto)},e.wbg.__wbg_process_038c26bf42b093f8=function(n){return s(i(n).process)},e.wbg.__wbg_versions_ab37218d2f0b24a8=function(n){return s(i(n).versions)},e.wbg.__wbg_node_080f4b19d15bc1fe=function(n){return s(i(n).node)},e.wbg.__wbindgen_is_string=function(n){return"string"==typeof i(n)},e.wbg.__wbg_msCrypto_6e7d3e1f92610cbb=function(n){return s(i(n).msCrypto)},e.wbg.__wbg_require_78a3dcfbdba9cbce=function(){return x((function(){return s(n.require)}),arguments)},e.wbg.__wbindgen_is_function=function(n){return"function"==typeof i(n)},e.wbg.__wbg_getRandomValues_805f1c3d65988a5a=function(){return x((function(n,e){i(n).getRandomValues(i(e))}),arguments)},e.wbg.__wbg_randomFillSync_6894564c2c334c42=function(){return x((function(n,e,t){i(n).randomFillSync(j(e,t))}),arguments)},e.wbg.__wbg_get_57245cc7d7c7619d=function(n,e){return s(i(n)[e>>>0])},e.wbg.__wbg_length_6e3bbe7c8bd4dbd8=function(n){return i(n).length},e.wbg.__wbg_new_1d9a920c6bfc44a8=function(){return s(new Array)},e.wbg.__wbg_newnoargs_b5b063fc6c2f0376=function(n,e){return s(new Function(f(n,e)))},e.wbg.__wbg_next_579e583d33566a86=function(n){return s(i(n).next)},e.wbg.__wbg_next_aaef7c8aa5e212ac=function(){return x((function(n){return s(i(n).next())}),arguments)},e.wbg.__wbg_done_1b73b0672e15f234=function(n){return i(n).done},e.wbg.__wbg_value_1ccc36bc03462d71=function(n){return s(i(n).value)},e.wbg.__wbg_iterator_6f9d4f28845f426c=function(){return s(Symbol.iterator)},e.wbg.__wbg_get_765201544a2b6869=function(){return x((function(n,e){return s(Reflect.get(i(n),i(e)))}),arguments)},e.wbg.__wbg_call_97ae9d8645dc388b=function(){return x((function(n,e){return s(i(n).call(i(e)))}),arguments)},e.wbg.__wbg_new_0b9bfdd97583284e=function(){return s(new Object)},e.wbg.__wbg_self_6d479506f72c6a71=function(){return x((function(){return s(self.self)}),arguments)},e.wbg.__wbg_window_f2557cc78490aceb=function(){return x((function(){return s(window.window)}),arguments)},e.wbg.__wbg_globalThis_7f206bda628d5286=function(){return x((function(){return s(globalThis.globalThis)}),arguments)},e.wbg.__wbg_global_ba75c50d1cf384f4=function(){return x((function(){return s(t.g.global)}),arguments)},e.wbg.__wbg_set_a68214f35c417fa9=function(n,e,t){i(n)[e>>>0]=c(t)},e.wbg.__wbg_isArray_27c46c67f498e15d=function(n){return Array.isArray(i(n))},e.wbg.__wbg_instanceof_ArrayBuffer_e5e48f4762c5610b=function(n){let e;try{e=i(n)instanceof ArrayBuffer}catch{e=!1}return e},e.wbg.__wbg_call_168da88779e35f61=function(){return x((function(n,e,t){return s(i(n).call(i(e),i(t)))}),arguments)},e.wbg.__wbg_isSafeInteger_dfa0593e8d7ac35a=function(n){return Number.isSafeInteger(i(n))},e.wbg.__wbg_buffer_3f3d764d4747d564=function(n){return s(i(n).buffer)},e.wbg.__wbg_new_8c3f0052272a457a=function(n){return s(new Uint8Array(i(n)))},e.wbg.__wbg_set_83db9690f9353e79=function(n,e,t){i(n).set(i(e),t>>>0)},e.wbg.__wbg_length_9e1ae1900cb0fbd5=function(n){return i(n).length},e.wbg.__wbg_instanceof_Uint8Array_971eeda69eb75003=function(n){let e;try{e=i(n)instanceof Uint8Array}catch{e=!1}return e},e.wbg.__wbg_newwithlength_f5933855e4f48a19=function(n){return s(new Uint8Array(n>>>0))},e.wbg.__wbg_subarray_58ad4efbb5bcb886=function(n,e,t){return s(i(n).subarray(e>>>0,t>>>0))},e.wbg.__wbindgen_debug_string=function(n,e){const t=d(A(i(e)),r.__wbindgen_malloc,r.__wbindgen_realloc),o=g;m()[n/4+1]=o,m()[n/4+0]=t},e.wbg.__wbindgen_throw=function(n,e){throw new Error(f(n,e))},e.wbg.__wbindgen_memory=function(){return s(r.memory)},e}async function U(n){void 0===n&&(n=new URL(t(671),t.b));const e=O();("string"==typeof n||"function"==typeof Request&&n instanceof Request||"function"==typeof URL&&n instanceof URL)&&(n=fetch(n));const{instance:o,module:i}=await async function(n,e){if("function"==typeof Response&&n instanceof Response){if("function"==typeof WebAssembly.instantiateStreaming)try{return await WebAssembly.instantiateStreaming(n,e)}catch(e){if("application/wasm"==n.headers.get("Content-Type"))throw e;console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",e)}const t=await n.arrayBuffer();return await WebAssembly.instantiate(t,e)}{const t=await WebAssembly.instantiate(n,e);return t instanceof WebAssembly.Instance?{instance:t,module:n}:t}}(await n,e);return function(n,e){return r=n.exports,U.__wbindgen_wasm_module=e,h=new Float64Array,p=new Int32Array,a=new Uint8Array,r}(o,i)}const T=U},671:(n,e,t)=>{n.exports=t.p+"d4ca74db0f5b52f1d1f7.wasm"}},e={};function t(r){var o=e[r];if(void 0!==o)return o.exports;var i=e[r]={id:r,loaded:!1,exports:{}};return n[r](i,i.exports,t),i.loaded=!0,i.exports}t.m=n,t.d=(n,e)=>{for(var r in e)t.o(e,r)&&!t.o(n,r)&&Object.defineProperty(n,r,{enumerable:!0,get:e[r]})},t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(n){if("object"==typeof window)return window}}(),t.hmd=n=>((n=Object.create(n)).children||(n.children=[]),Object.defineProperty(n,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+n.id)}}),n),t.o=(n,e)=>Object.prototype.hasOwnProperty.call(n,e),(()=>{var n;t.g.importScripts&&(n=t.g.location+"");var e=t.g.document;if(!n&&e&&(e.currentScript&&(n=e.currentScript.src),!n)){var r=e.getElementsByTagName("script");r.length&&(n=r[r.length-1].src)}if(!n)throw new Error("Automatic publicPath is not supported in this browser");n=n.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),t.p=n})(),t.b=self.location+"",(()=>{var n=t(152);function e(n){try{self.postMessage(n())}catch(n){const e={error:n,single_answer:null,counter:null,answer:null};self.postMessage(e)}}self.onmessage=function(t){(0,n.ZP)().then((()=>{t.data.real_time_progress_bar?function({method:t,n_seats:r,n_voters:o,parties:i}){let _=1;for(let c=100;c>-100;c--)for(let u=-100;u<100;u++)e((()=>({single_answer:(0,n.dQ)(t,r,o,i,u/100,c/100),counter:_,error:null,answer:null}))),_+=1}(t.data):function({method:t,n_seats:r,n_voters:o,parties:i}){e((()=>({answer:(0,n.mT)(t,r,o,i),error:null,single_answer:null,counter:null})))}(t.data)}))}})()})();