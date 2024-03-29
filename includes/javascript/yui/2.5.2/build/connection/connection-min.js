/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.5.2
*/
YAHOO.util.Connect={_msxml_progid:["Microsoft.XMLHTTP","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP"],_http_headers:{},_has_http_headers:false,_use_default_post_header:true,_default_post_header:"application/x-www-form-urlencoded; charset=UTF-8",_default_form_header:"application/x-www-form-urlencoded",_use_default_xhr_header:true,_default_xhr_header:"XMLHttpRequest",_has_default_headers:true,_default_headers:{},_isFormSubmit:false,_isFileUpload:false,_formNode:null,_sFormData:null,_poll:{},_timeOut:{},_polling_interval:50,_transaction_id:0,_submitElementValue:null,_hasSubmitListener:(function(){if(YAHOO.util.Event){YAHOO.util.Event.addListener(document,"click",function(B){var A=YAHOO.util.Event.getTarget(B);if(A.nodeName.toLowerCase()=="input"&&(A.type&&A.type.toLowerCase()=="submit")){YAHOO.util.Connect._submitElementValue=encodeURIComponent(A.name)+"="+encodeURIComponent(A.value);}});return true;}return false;})(),startEvent:new YAHOO.util.CustomEvent("start"),completeEvent:new YAHOO.util.CustomEvent("complete"),successEvent:new YAHOO.util.CustomEvent("success"),failureEvent:new YAHOO.util.CustomEvent("failure"),uploadEvent:new YAHOO.util.CustomEvent("upload"),abortEvent:new YAHOO.util.CustomEvent("abort"),_customEvents:{onStart:["startEvent","start"],onComplete:["completeEvent","complete"],onSuccess:["successEvent","success"],onFailure:["failureEvent","failure"],onUpload:["uploadEvent","upload"],onAbort:["abortEvent","abort"]},setProgId:function(A){this._msxml_progid.unshift(A);YAHOO.log("ActiveX Program Id  "+A+" added to _msxml_progid.","info","Connection");},setDefaultPostHeader:function(A){if(typeof A=="string"){this._default_post_header=A;YAHOO.log("Default POST header set to  "+A,"info","Connection");}else{if(typeof A=="boolean"){this._use_default_post_header=A;}}},setDefaultXhrHeader:function(A){if(typeof A=="string"){this._default_xhr_header=A;YAHOO.log("Default XHR header set to  "+A,"info","Connection");}else{this._use_default_xhr_header=A;}},setPollingInterval:function(A){if(typeof A=="number"&&isFinite(A)){this._polling_interval=A;YAHOO.log("Default polling interval set to "+A+"ms","info","Connection");}},createXhrObject:function(E){var D,A;try{A=new XMLHttpRequest();D={conn:A,tId:E};YAHOO.log("XHR object created for transaction "+E,"info","Connection");}catch(C){for(var B=0;B<this._msxml_progid.length;++B){try{A=new ActiveXObject(this._msxml_progid[B]);D={conn:A,tId:E};YAHOO.log("ActiveX XHR object created for transaction "+E,"info","Connection");break;}catch(C){}}}finally{return D;}},getConnectionObject:function(A){var C;var D=this._transaction_id;try{if(!A){C=this.createXhrObject(D);}else{C={};C.tId=D;C.isUpload=true;}if(C){this._transaction_id++;}}catch(B){}finally{return C;}},asyncRequest:function(F,C,E,A){var D=(this._isFileUpload)?this.getConnectionObject(true):this.getConnectionObject();var B=(E&&E.argument)?E.argument:null;if(!D){YAHOO.log("Unable to create connection object.","error","Connection");return null;}else{if(E&&E.customevents){this.initCustomEvents(D,E);}if(this._isFormSubmit){if(this._isFileUpload){this.uploadFile(D,E,C,A);return D;}if(F.toUpperCase()=="GET"){if(this._sFormData.length!==0){C+=((C.indexOf("?")==-1)?"?":"&")+this._sFormData;}}else{if(F.toUpperCase()=="POST"){A=A?this._sFormData+"&"+A:this._sFormData;}}}if(F.toUpperCase()=="GET"&&(E&&E.cache===false)){C+=((C.indexOf("?")==-1)?"?":"&")+"rnd="+new Date().valueOf().toString();}D.conn.open(F,C,true);if(this._use_default_xhr_header){if(!this._default_headers["X-Requested-With"]){this.initHeader("X-Requested-With",this._default_xhr_header,true);YAHOO.log("Initialize transaction header X-Request-Header to XMLHttpRequest.","info","Connection");}}if((F.toUpperCase()=="POST"&&this._use_default_post_header)&&this._isFormSubmit===false){this.initHeader("Content-Type",this._default_post_header);YAHOO.log("Initialize header Content-Type to application/x-www-form-urlencoded; UTF-8 for POST transaction.","info","Connection");}if(this._has_default_headers||this._has_http_headers){this.setHeader(D);}this.handleReadyState(D,E);D.conn.send(A||"");YAHOO.log("Transaction "+D.tId+" sent.","info","Connection");if(this._isFormSubmit===true){this.resetFormState();}this.startEvent.fire(D,B);if(D.startEvent){D.startEvent.fire(D,B);}return D;}},initCustomEvents:function(A,C){for(var B in C.customevents){if(this._customEvents[B][0]){A[this._customEvents[B][0]]=new YAHOO.util.CustomEvent(this._customEvents[B][1],(C.scope)?C.scope:null);YAHOO.log("Transaction-specific Custom Event "+A[this._customEvents[B][1]]+" created.","info","Connection");A[this._customEvents[B][0]].subscribe(C.customevents[B]);YAHOO.log("Transaction-specific Custom Event "+A[this._customEvents[B][1]]+" subscribed.","info","Connection");}}},handleReadyState:function(C,D){var B=this;var A=(D&&D.argument)?D.argument:null;if(D&&D.timeout){this._timeOut[C.tId]=window.setTimeout(function(){B.abort(C,D,true);},D.timeout);}this._poll[C.tId]=window.setInterval(function(){if(C.conn&&C.conn.readyState===4){window.clearInterval(B._poll[C.tId]);delete B._poll[C.tId];if(D&&D.timeout){window.clearTimeout(B._timeOut[C.tId]);delete B._timeOut[C.tId];}B.completeEvent.fire(C,A);if(C.completeEvent){C.completeEvent.fire(C,A);}B.handleTransactionResponse(C,D);}},this._polling_interval);},handleTransactionResponse:function(F,G,A){var D,C;var B=(G&&G.argument)?G.argument:null;try{if(F.conn.status!==undefined&&F.conn.status!==0){D=F.conn.status;}else{D=13030;}}catch(E){D=13030;}if(D>=200&&D<300||D===1223){C=this.createResponseObject(F,B);if(G&&G.success){if(!G.scope){G.success(C);YAHOO.log("Success callback. HTTP code is "+D,"info","Connection");}else{G.success.apply(G.scope,[C]);YAHOO.log("Success callback with scope. HTTP code is "+D,"info","Connection");}}this.successEvent.fire(C);if(F.successEvent){F.successEvent.fire(C);}}else{switch(D){case 12002:case 12029:case 12030:case 12031:case 12152:case 13030:C=this.createExceptionObject(F.tId,B,(A?A:false));if(G&&G.failure){if(!G.scope){G.failure(C);
YAHOO.log("Failure callback. Exception detected. Status code is "+D,"warn","Connection");}else{G.failure.apply(G.scope,[C]);YAHOO.log("Failure callback with scope. Exception detected. Status code is "+D,"warn","Connection");}}break;default:C=this.createResponseObject(F,B);if(G&&G.failure){if(!G.scope){G.failure(C);YAHOO.log("Failure callback. HTTP status code is "+D,"warn","Connection");}else{G.failure.apply(G.scope,[C]);YAHOO.log("Failure callback with scope. HTTP status code is "+D,"warn","Connection");}}}this.failureEvent.fire(C);if(F.failureEvent){F.failureEvent.fire(C);}}this.releaseObject(F);C=null;},createResponseObject:function(A,G){var D={};var I={};try{var C=A.conn.getAllResponseHeaders();var F=C.split("\n");for(var E=0;E<F.length;E++){var B=F[E].indexOf(":");if(B!=-1){I[F[E].substring(0,B)]=F[E].substring(B+2);}}}catch(H){}D.tId=A.tId;D.status=(A.conn.status==1223)?204:A.conn.status;D.statusText=(A.conn.status==1223)?"No Content":A.conn.statusText;D.getResponseHeader=I;D.getAllResponseHeaders=C;D.responseText=A.conn.responseText;D.responseXML=A.conn.responseXML;if(G){D.argument=G;}return D;},createExceptionObject:function(H,D,A){var F=0;var G="communication failure";var C=-1;var B="transaction aborted";var E={};E.tId=H;if(A){E.status=C;E.statusText=B;}else{E.status=F;E.statusText=G;}if(D){E.argument=D;}return E;},initHeader:function(A,D,C){var B=(C)?this._default_headers:this._http_headers;B[A]=D;if(C){this._has_default_headers=true;}else{this._has_http_headers=true;}},setHeader:function(A){if(this._has_default_headers){for(var B in this._default_headers){if(YAHOO.lang.hasOwnProperty(this._default_headers,B)){A.conn.setRequestHeader(B,this._default_headers[B]);YAHOO.log("Default HTTP header "+B+" set with value of "+this._default_headers[B],"info","Connection");}}}if(this._has_http_headers){for(var B in this._http_headers){if(YAHOO.lang.hasOwnProperty(this._http_headers,B)){A.conn.setRequestHeader(B,this._http_headers[B]);YAHOO.log("HTTP header "+B+" set with value of "+this._http_headers[B],"info","Connection");}}delete this._http_headers;this._http_headers={};this._has_http_headers=false;}},resetDefaultHeaders:function(){delete this._default_headers;this._default_headers={};this._has_default_headers=false;},setForm:function(K,E,B){this.resetFormState();var J;if(typeof K=="string"){J=(document.getElementById(K)||document.forms[K]);}else{if(typeof K=="object"){J=K;}else{YAHOO.log("Unable to create form object "+K,"warn","Connection");return ;}}if(E){var F=this.createFrame((window.location.href.toLowerCase().indexOf("https")===0||B)?true:false);this._isFormSubmit=true;this._isFileUpload=true;this._formNode=J;return ;}var A,I,G,L;var H=false;for(var D=0;D<J.elements.length;D++){A=J.elements[D];L=A.disabled;I=A.name;G=A.value;if(!L&&I){switch(A.type){case"select-one":case"select-multiple":for(var C=0;C<A.options.length;C++){if(A.options[C].selected){if(window.ActiveXObject){this._sFormData+=encodeURIComponent(I)+"="+encodeURIComponent(A.options[C].attributes["value"].specified?A.options[C].value:A.options[C].text)+"&";}else{this._sFormData+=encodeURIComponent(I)+"="+encodeURIComponent(A.options[C].hasAttribute("value")?A.options[C].value:A.options[C].text)+"&";}}}break;case"radio":case"checkbox":if(A.checked){this._sFormData+=encodeURIComponent(I)+"="+encodeURIComponent(G)+"&";}break;case"file":case undefined:case"reset":case"button":break;case"submit":if(H===false){if(this._hasSubmitListener&&this._submitElementValue){this._sFormData+=this._submitElementValue+"&";}else{this._sFormData+=encodeURIComponent(I)+"="+encodeURIComponent(G)+"&";}H=true;}break;default:this._sFormData+=encodeURIComponent(I)+"="+encodeURIComponent(G)+"&";}}}this._isFormSubmit=true;this._sFormData=this._sFormData.substr(0,this._sFormData.length-1);YAHOO.log("Form initialized for transaction. HTML form POST message is: "+this._sFormData,"info","Connection");this.initHeader("Content-Type",this._default_form_header);YAHOO.log("Initialize header Content-Type to application/x-www-form-urlencoded for setForm() transaction.","info","Connection");return this._sFormData;},resetFormState:function(){this._isFormSubmit=false;this._isFileUpload=false;this._formNode=null;this._sFormData="";},createFrame:function(A){var B="yuiIO"+this._transaction_id;var C;if(window.ActiveXObject){C=document.createElement('<iframe id="'+B+'" name="'+B+'" />');if(typeof A=="boolean"){C.src="javascript:false";}}else{C=document.createElement("iframe");C.id=B;C.name=B;}C.style.position="absolute";C.style.top="-1000px";C.style.left="-1000px";document.body.appendChild(C);YAHOO.log("File upload iframe created. Id is:"+B,"info","Connection");},appendPostData:function(A){var D=[];var B=A.split("&");for(var C=0;C<B.length;C++){var E=B[C].indexOf("=");if(E!=-1){D[C]=document.createElement("input");D[C].type="hidden";D[C].name=B[C].substring(0,E);D[C].value=B[C].substring(E+1);this._formNode.appendChild(D[C]);}}return D;},uploadFile:function(D,M,E,C){var N=this;var H="yuiIO"+D.tId;var I="multipart/form-data";var K=document.getElementById(H);var J=(M&&M.argument)?M.argument:null;var B={action:this._formNode.getAttribute("action"),method:this._formNode.getAttribute("method"),target:this._formNode.getAttribute("target")};this._formNode.setAttribute("action",E);this._formNode.setAttribute("method","POST");this._formNode.setAttribute("target",H);if(YAHOO.env.ua.ie){this._formNode.setAttribute("encoding",I);}else{this._formNode.setAttribute("enctype",I);}if(C){var L=this.appendPostData(C);}this._formNode.submit();this.startEvent.fire(D,J);if(D.startEvent){D.startEvent.fire(D,J);}if(M&&M.timeout){this._timeOut[D.tId]=window.setTimeout(function(){N.abort(D,M,true);},M.timeout);}if(L&&L.length>0){for(var G=0;G<L.length;G++){this._formNode.removeChild(L[G]);}}for(var A in B){if(YAHOO.lang.hasOwnProperty(B,A)){if(B[A]){this._formNode.setAttribute(A,B[A]);}else{this._formNode.removeAttribute(A);}}}this.resetFormState();var F=function(){if(M&&M.timeout){window.clearTimeout(N._timeOut[D.tId]);
delete N._timeOut[D.tId];}N.completeEvent.fire(D,J);if(D.completeEvent){D.completeEvent.fire(D,J);}var P={};P.tId=D.tId;P.argument=M.argument;try{P.responseText=K.contentWindow.document.body?K.contentWindow.document.body.innerHTML:K.contentWindow.document.documentElement.textContent;P.responseXML=K.contentWindow.document.XMLDocument?K.contentWindow.document.XMLDocument:K.contentWindow.document;}catch(O){}if(M&&M.upload){if(!M.scope){M.upload(P);YAHOO.log("Upload callback.","info","Connection");}else{M.upload.apply(M.scope,[P]);YAHOO.log("Upload callback with scope.","info","Connection");}}N.uploadEvent.fire(P);if(D.uploadEvent){D.uploadEvent.fire(P);}YAHOO.util.Event.removeListener(K,"load",F);setTimeout(function(){document.body.removeChild(K);N.releaseObject(D);YAHOO.log("File upload iframe destroyed. Id is:"+H,"info","Connection");},100);};YAHOO.util.Event.addListener(K,"load",F);},abort:function(E,G,A){var D;var B=(G&&G.argument)?G.argument:null;if(E&&E.conn){if(this.isCallInProgress(E)){E.conn.abort();window.clearInterval(this._poll[E.tId]);delete this._poll[E.tId];if(A){window.clearTimeout(this._timeOut[E.tId]);delete this._timeOut[E.tId];}D=true;}}else{if(E&&E.isUpload===true){var C="yuiIO"+E.tId;var F=document.getElementById(C);if(F){YAHOO.util.Event.removeListener(F,"load");document.body.removeChild(F);YAHOO.log("File upload iframe destroyed. Id is:"+C,"info","Connection");if(A){window.clearTimeout(this._timeOut[E.tId]);delete this._timeOut[E.tId];}D=true;}}else{D=false;}}if(D===true){this.abortEvent.fire(E,B);if(E.abortEvent){E.abortEvent.fire(E,B);}this.handleTransactionResponse(E,G,true);YAHOO.log("Transaction "+E.tId+" aborted.","info","Connection");}return D;},isCallInProgress:function(B){if(B&&B.conn){return B.conn.readyState!==4&&B.conn.readyState!==0;}else{if(B&&B.isUpload===true){var A="yuiIO"+B.tId;return document.getElementById(A)?true:false;}else{return false;}}},releaseObject:function(A){if(A&&A.conn){A.conn=null;YAHOO.log("Connection object for transaction "+A.tId+" destroyed.","info","Connection");A=null;}}};YAHOO.register("connection",YAHOO.util.Connect,{version:"2.5.2",build:"1076"});
