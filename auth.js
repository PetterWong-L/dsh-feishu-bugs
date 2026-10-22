import {runCli} from './cli.js';
import QRCode from 'qrcode';
export function validateAuthUrl(value){
 let u;try{u=new URL(value);}catch{throw Error('Missing official authorization URL');}
 if(u.protocol!=='https:'||u.username||u.password||u.port||!(u.hostname==='feishu.cn'||u.hostname.endsWith('.feishu.cn')))throw Error('Invalid official authorization URL');
 return u.href;
}
export class DeviceAuth{
 constructor({run=runCli,qr=url=>QRCode.toDataURL(url,{width:256,margin:2,errorCorrectionLevel:'M'}),now=Date.now,changed=()=>{},auto=false}={}){Object.assign(this,{run,qr,now,changed,auto});this.view={state:'idle'};this.generation=0;this.checkSequence=0;}
 status(){return {...this.view};}
 ownerView(){return {...this.status(),...(this.session?{qr:this.session.qr,url:this.session.url,userCode:this.session.userCode,expiresAt:this.session.expiresAt}:{})};}
 publish(state){this.view=state;this.changed();}
 cancel(){this.generation++;this.checkSequence++;clearTimeout(this.timer);this.controller?.abort();this.checkController?.abort();this.session=null;this.publish({state:'idle'});}
 dispose(){this.cancel();}
 async begin(){
  if(this.initializing||this.polling)throw Error('Authorization already in progress');
  this.cancel();const generation=this.generation;this.initializing=true;this.controller=new AbortController();this.publish({state:'initializing'});
  try{
   const d=await this.run(['auth','login','--device-code','--phase','init','--host','project.feishu.cn'],{signal:this.controller.signal});
   if(generation!==this.generation)return;
   const url=validateAuthUrl(d.verification_uri_complete??d.verification_uri);
   if(typeof d.device_code!=='string'||!d.device_code||typeof d.client_id!=='string'||!d.client_id||!Number.isFinite(d.expires_in)||d.expires_in<1)throw Error('Unsupported official device authorization response');
   const qr=await this.qr(url);if(generation!==this.generation)return;
   this.session={deviceCode:d.device_code,clientId:d.client_id,url,qr,userCode:typeof d.user_code==='string'?d.user_code.slice(0,32):'',expiresAt:this.now()+Math.min(d.expires_in,900)*1000,interval:Math.min(Math.max(Number(d.interval)||5,5),60)};
   this.publish({state:'pending'});this.schedule();
  }catch(e){if(generation===this.generation){this.session=null;this.publish({state:'error',message:'Unable to start official authorization. Check network and CLI permissions.'});throw e;}}
  finally{this.initializing=false;}
 }
 schedule(){clearTimeout(this.timer);if(this.auto&&this.session){this.timer=setTimeout(()=>this.poll().catch(()=>{}),this.session.interval*1000);this.timer.unref?.();}}
 async check(){
  const generation=this.generation,sequence=++this.checkSequence;
  this.checkController?.abort();this.checkController=new AbortController();
  const stale=()=>generation!==this.generation||sequence!==this.checkSequence;
  try{const d=await this.run(['auth','status'],{allowStatus:true,signal:this.checkController.signal});if(stale())return false;if(typeof d.authenticated!=='boolean')throw Error('Unsupported authorization status');
   if(d.authenticated&&d.host!=='project.feishu.cn')throw Error('Unexpected authorization host');
   if(d.authenticated){this.generation++;this.controller?.abort();this.session=null;clearTimeout(this.timer);this.publish({state:'authenticated'});return true;}
   if(!this.session&&!this.initializing)this.publish({state:'idle'});return false;
  }catch{if(stale())return false;this.publish({state:'unreachable',message:'Meegle service unavailable. Existing credentials have not been cleared.'});throw Error('Meegle service unavailable; retry the status check later');}
 }
 async poll(){
  if(this.polling||!this.session)return;const generation=this.generation,s=this.session;
  if(this.now()>=s.expiresAt){this.session=null;this.publish({state:'expired'});return;}
  this.polling=true;
  try{
   // The CLI owns protocol handling and keychain writes. Only auth status proves login.
   // Pending/error output varies across CLI versions. Never interpret it as proof
   // of login; a subsequent server-verified status check remains authoritative.
   try{await this.run(['auth','login','--device-code','--phase','poll','--once','--host','project.feishu.cn','--device-code-value',s.deviceCode,'--client-id',s.clientId],{signal:this.controller?.signal,allowStatus:true});}catch{}
   if(generation!==this.generation)return;
   if(!await this.check()&&generation===this.generation&&this.session===s)this.publish({state:'pending'});
  }catch{if(generation===this.generation)this.publish({state:'unreachable',message:'Authorization check unavailable; retry or generate a new code.'});}
  finally{this.polling=false;if(generation===this.generation)this.schedule();}
 }
}
