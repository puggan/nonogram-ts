"use strict";document.addEventListener("DOMContentLoaded",function(){function d(t){localStorage.setItem("game",JSON.stringify(t))}function u(){for(var t=!0,e=!0,n=0,i=m.status.cols;n<i.length;n++){var o=i[n];if(o<0){e=t=!1;break}65535!==o&&(e=!1)}for(var s=0,r=m.status.rows;s<r.length;s++){var l=r[s];if(l<0){e=t=!1;break}65535!==l&&(e=!1)}return m.status.global=t?e?65535:0:-65535,m.status.global}var e=document.getElementById("introView"),i=(document.getElementById("solverView"),document.getElementById("gridView")),c=i.getContext("2d"),t=document.getElementById("startButton"),n=document.getElementById("width"),o=document.getElementById("height"),m=null,s=function(t){e.hidden=!0,i.hidden=!1,m=t,r(),g(!0),window.game=m},r=function(){for(var t=0;t<m.config.width;t++)m.status.cols[t]=w(t);for(var e=0;e<m.config.height;e++)m.status.rows[e]=x(e);u()};window.nano=window.nano||{},window.nano.statusAll=r;function I(t){for(var e=t;e.next;)f(e),e.next.start.min<=e.end.min&&(e.next.start.min=e.end.min+1),e.next.start.max>e.end.max+1&&(e.next.start.max=e.end.max+1),e=e.next;f(e)}function S(t){for(var e=t;e.prev;)f(e),e.prev.end.max>=e.start.max&&(e.prev.end.max=e.start.max-1),e.prev.end.min<e.start.min-1&&(e.prev.end.min=e.start.min-1),e=e.prev;f(e)}function v(t,e){for(var n=[],i=0,o=0,s=t;o<s.length;o++)i+=s[o];var r=e.length-i-t.length+1,l={end:{max:r-1,min:-1},length:{max:r,min:0},next:null,possibilities:[],prev:null,start:{max:0,min:0},type:0};n.push(l);for(var a=l,f=l,c=0,g=t;c<g.length;c++){var h=g[c],d=a.start.min+a.length.min,f={end:{max:d+h-1+r,min:d+h-1},length:{max:h,min:h},next:null,possibilities:[],prev:a,start:{max:d+r,min:d},type:1};a.next=f,n.push(f);d=f.end.min+1,a={end:{max:d+r,min:d},length:{max:1+r,min:1},next:null,possibilities:[],prev:f,start:{max:d+r,min:d},type:0};f.next=a,n.push(a)}a.length.min--,a.length.max--,a.end.max--,a.end.min=a.end.max;for(var u=0,m=n;u<m.length;u++)for(var v=(b=m[u]).start.min;v<=b.start.max;v++)for(var w=b.length.min;w<=b.length.max;w++){var x=v+w-1;b.end.min<=x&&x<=b.end.max&&b.possibilities.push({end:x,start:v})}I(l),S(a);for(var p=0,y=n;p<y.length;p++)for(var b=y[p],O=0;O<e.length;O++)!function(t,e,n){if(-1!==e)if(n.type!==e){for(var i=[],o=0,s=n.possibilities;o<s.length;o++)(r=s[o]).start<=t&&t<=r.end||i.push(r);i.length<n.possibilities.length&&(n.possibilities=i)}else{for(var r,l=[],a=0,f=n.possibilities;a<f.length;a++)t!==(r=f[a]).start-1&&t!==r.end+1&&l.push(r);l.length<n.possibilities.length&&(n.possibilities=l)}}(O,e[O],b);return I(l),S(a),n}function l(t,e){for(var n=1,i=0,o=!0,s=0,r=v(t,e);s<r.length;s++){var l=r[s],a=l.possibilities.length;if(a<1)return-65535;if(0!==l.type){var f=1===a;if(f)for(var c=l.possibilities[0],g=c.start;g<=c.end;g++)if(e[g]!==l.type){f=!1;break}f?i|=n:o=!1,n*=2}}return o?65535:i}function a(){var t=n.value;localStorage.setItem("width",t);var e=o.value;localStorage.setItem("height",e),function(t,e){for(var n={cols:[],config:{height:e,scale:10,width:t,xOffset:10,yOffset:10},grid:[],rows:[],status:{cols:[],rows:[],global:0}},i=0;i<t;i++)n.cols[i]=[],n.status.cols[i]=0;for(var o=0;o<e;o++){n.rows[o]=[],n.status.rows[o]=0,n.grid[o]=[];for(i=0;i<t;i++)n.grid[o][i]=-1}d(n),s(n)}(+t,+e)}var f=function(t){for(var e={max:-1/0,min:1/0},n={end:{max:-1/0,min:1/0},start:{max:-1/0,min:1/0}},i=[],o=0,s=t.possibilities;o<s.length;o++){var r=s[o],l=r.end+1-r.start;r.start<t.start.min||r.start>t.start.max||r.end<t.end.min||r.end>t.end.max||l<t.length.min||l>t.length.max||(i.push(r),r.start<n.start.min&&(n.start.min=r.start),r.start>n.start.max&&(n.start.max=r.start),r.end<n.end.min&&(n.end.min=r.end),r.end>n.end.max&&(n.end.max=r.end),l<e.min&&(e.min=l),l>e.max&&(e.max=l))}i.length<t.possibilities.length&&(t.possibilities=i),0<t.possibilities.length&&(t.start=n.start,t.end=n.end,t.length=e)},w=function(t){if(m.cols[t].length<1)return 0;for(var e=[],n=0,i=m.grid;n<i.length;n++){var o=i[n];e.push(o[t])}return l(m.cols[t],e)},x=function(t){return m.rows[t].length<1?0:l(m.rows[t],m.grid[t])},g=function(t){!function(t){for(var e=1,n=1,i=0,o=m.cols;i<o.length;i++){var s=o[i];s.length>e&&(e=s.length)}for(var r,l=0,a=m.rows;l<a.length;l++){var f=a[l];f.length>n&&(n=f.length)}t&&(r=(window.innerWidth-10)/(n+m.config.width),t=(window.innerHeight-10)/(e+m.config.height),m.config.scale=Math.floor(r<t?r:t),m.config.scale<5&&(m.config.scale=5)),m.config.xOffset=m.config.scale*n,m.config.yOffset=m.config.scale*e}(t),i.width=m.config.xOffset+m.config.width*m.config.scale,i.height=m.config.yOffset+m.config.height*m.config.scale,c.clearRect(0,0,i.width,i.height),K();for(var e=0;e<m.config.width;e++)R(e);for(var n=0;n<m.config.height;n++)k(n);B()};window.nano=window.nano||{},window.nano.redraw=g;function h(t){if(!(m.cols[t].length<1)){for(var e=[],n=0,i=m.grid;n<i.length;n++){var o=i[n];e.push(o[t])}for(var s=!1,r=v(m.cols[t],e),l=m.status.global,a=0,f=r;a<f.length;a++)for(var c,g=f[a],h=g.start.max;h<=g.end.min;h++)m.grid[h][t]!==g.type&&(m.grid[h][t]=g.type,s=!0,F(t,h,g.type),c=x(h),m.status.rows[h]!==c&&(m.status.rows[h]=c,k(h)));return s&&(r=w(t),m.status.cols[t]!==r&&(m.status.cols[t]=r,R(t)),l!==u()&&K(),d(m)),s}}function p(t,e){if(e||m.cols[t].length<=0)return function(t){var e=m.cols[t].join(" "),n=prompt("Config col "+(1+t),e);if(null!==n&&e!==n){if(""===n)return m.cols[t].length=0,void d(m);for(var i=[],o=0,s=0,r=n.split(/[ ,]+/g);s<r.length;s++){var l=r[s],l=Math.floor(+l);0<l&&i.push(l),o+=l}return i.length<1?(console.error("Invalid col: "+n),void alert("Invalid col: "+n)):o+i.length>m.config.height+1?(console.error("Invalid col-size: "+n),console.error(i),void alert("Invalid col-size: "+n)):(m.cols[t]=i,d(m),m.status.cols[t]=w(t),void R(t))}}(t);h(t)}function y(t){if(!(m.rows[t].length<1)){for(var e=!1,n=v(m.rows[t],m.grid[t]),i=m.status.global,o=0,s=n;o<s.length;o++)for(var r,l=s[o],a=l.start.max;a<=l.end.min;a++)m.grid[t][a]!==l.type&&(m.grid[t][a]=l.type,e=!0,F(a,t,l.type),r=w(a),m.status.cols[a]!==r&&(m.status.cols[a]=r,R(a)));return e&&(n=x(t),m.status.rows[t]!==n&&(m.status.rows[t]=n,k(t)),i!==u()&&K(),d(m)),e}}function b(t,e){if(e||m.rows[t].length<=0)return function(t){var e=m.rows[t].join(" "),n=prompt("Config row "+(1+t),e);if(null!==n&&e!==n){if(""===n)return m.rows[t].length=0,void d(m);for(var i=[],o=0,s=0,r=n.split(/[ ,]+/g);s<r.length;s++){var l=r[s],l=Math.floor(+l);0<l&&i.push(l),o+=l}return i.length<1?(console.error("Invalid row: "+n),void alert("Invalid row: "+n)):o+i.length>m.config.width+1?(console.error("Invalid row-size: "+n),console.error({newList:i,width:m.config.width,sum:o,length:i.length,max:o+i.length-1}),void alert("Invalid row-size: "+n)):(m.rows[t]=i,d(m),m.status.rows[t]=x(t),void k(t))}}(t);y(t)}var O,C,E,K=function(){m.status.global?c.fillStyle=m.status.global<0?"#FCC":"#CFC":c.fillStyle="white",c.fillRect(0,0,m.config.xOffset,m.config.yOffset)},B=function(){for(var t=0;t<m.config.height;t++)for(var e=0;e<m.config.width;e++)F(e,t,m.grid[t][e])},R=function(t){var e=m.config.scale/2,n=m.config.yOffset-m.cols[t].length*m.config.scale+e,i=m.config.xOffset+t*m.config.scale+e;c.fillStyle=1&t?"#FFF":"#CCC",c.fillRect(i-e,0,m.config.scale,m.config.yOffset),c.font=.8*m.config.scale+"px Monospace",c.textAlign="center",c.textBaseline="middle";for(var o=0<m.status.cols[t]?"gray":"red",s=0<m.status.cols[t]?m.status.cols[t]:-m.status.cols[t],r=1,l=0,a=m.cols[t];l<a.length;l++){var f=a[l];c.fillStyle=s&r?o:"black",c.fillText(""+f,i,n),r*=2,n+=m.config.scale}},k=function(t){var e=m.config.scale/2,n=m.config.yOffset+t*m.config.scale+e,i=m.config.xOffset-m.rows[t].length*m.config.scale+e;c.fillStyle=1&t?"#FFF":"#CCC",c.fillRect(0,n-e,m.config.xOffset,m.config.scale),c.font=.8*m.config.scale+"px Monospace",c.textAlign="center",c.textBaseline="middle";for(var o=0<m.status.rows[t]?"gray":"red",s=0<m.status.rows[t]?m.status.rows[t]:-m.status.rows[t],r=1,l=0,a=m.rows[t];l<a.length;l++){var f=a[l];c.fillStyle=s&r?o:"black",c.fillText(""+f,i,n),r*=2,i+=m.config.scale}},F=function(t,e,n){if(t<0||e<0||t>=m.config.width||e>=m.config.height)throw new Error("Outside game-grid: "+JSON.stringify({x:t,y:e,type:n}));t=m.config.xOffset+t*m.config.scale,e=m.config.yOffset+e*m.config.scale;c.fillStyle="#808080",c.fillRect(t,e,m.config.scale,m.config.scale),c.fillStyle="#C0C0C0",c.fillRect(t,e,m.config.scale-1,m.config.scale-1),c.fillStyle="#404040",c.fillRect(t+1,e+1,m.config.scale-1,m.config.scale-1),c.fillStyle=n<0?"#808080":n?"black":"white",c.fillRect(t+1,e+1,m.config.scale-2,m.config.scale-2)},M=function(t){var e=Math.floor((t.clientX-m.config.xOffset)/m.config.scale),n=Math.floor((t.clientY-m.config.yOffset)/m.config.scale);return e<0?n<0?function(t){if(t.ctrlKey&&confirm("Delete game?"))localStorage.removeItem("game"),location.reload();else if(t.metaKey){for(var e=0;e<m.config.width;e++)if(h(e)&&!t.shiftKey)return;for(var n=0;n<m.config.height;n++)if(y(n)&&!t.shiftKey)return}else t.shiftKey&&confirm("Reset game?")?(d(function(t){t.grid=[],t.status={cols:[],rows:[],global:0};for(var e=0;e<t.config.width;e++)t.status.cols[e]=0;for(var n=0;n<t.config.height;n++){t.status.rows[n]=0,t.grid[n]=[];for(e=0;e<t.config.width;e++)t.grid[n][e]=-1}return t}(m)),location.reload()):s(m)}(t):b(n,t.shiftKey||t.ctrlKey):n<0?p(e,t.shiftKey||t.ctrlKey):function(t,e,n){var i=(1+m.grid[e][t]+(n?1:2))%3-1;m.grid[e][t]=i,d(m),F(t,e,i);n=m.status.global,i=w(t);m.status.cols[t]!==i&&(m.status.cols[t]=i,R(t));t=x(e);m.status.rows[e]!==t&&(m.status.rows[e]=t,k(e)),n!==u()&&K()}(e,n,0<t.button||t.shiftKey)};O=localStorage.getItem("width"),C=localStorage.getItem("height"),E=localStorage.getItem("game"),O&&(n.value=O),C&&(o.value=C),E&&(E=JSON.parse(E),s(E)),t.addEventListener("click",a,{once:!1,passive:!0}),i.addEventListener("click",M,{once:!1,passive:!0})},{once:!0,passive:!0});
//# sourceMappingURL=es5.js.map
