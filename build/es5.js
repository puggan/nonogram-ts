"use strict";document.addEventListener("DOMContentLoaded",function(){function d(t){localStorage.setItem("game",JSON.stringify(t))}function t(){var t=s.value;localStorage.setItem("width",t);var e=r.value;localStorage.setItem("height",e),function(t,e){for(var o={cols:[],config:{height:e,scale:10,width:t,xOffset:10,yOffset:10},grid:[],rows:[],status:{cols:[],rows:[],global:0}},i=0;i<t;i++)o.cols[i]=[],o.status.cols[i]=0;for(var n=0;n<e;n++){o.rows[n]=[],o.status.rows[n]=0,o.grid[n]=[];for(i=0;i<t;i++)o.grid[n][i]=-1}d(o),f(o)}(+t,+e)}var e,o,i,n=document.getElementById("introView"),l=(document.getElementById("solverView"),document.getElementById("gridView")),g=l.getContext("2d"),c=document.getElementById("startButton"),s=document.getElementById("width"),r=document.getElementById("height"),u=null,f=function(t){n.hidden=!0,l.hidden=!1,u=t,a(),m(!0)},a=function(){for(var t=0;t<u.config.width;t++)u.status.cols[t]=v(t);for(var e=0;e<u.config.height;e++)u.status.rows[e]=w(e)},v=function(t){if(u.cols[t].length<1)return 0;for(var e=0,o=0,i=[],n=0,l=u.cols[t];n<l.length;n++){var c=l[n];0<c&&(e+=c)}for(var s=!1,r=0,f=0,g=u.grid;f<g.length;f++)1===g[f][t]?(s=!0,r++,o++):s&&(i.push(r),r=0,s=!1);return s&&i.push(r),e<o?-65535:o<e?0:i.join("-")===u.cols[t].join("-")?65535:-65535},w=function(t){if(u.rows[t].length<1)return 0;for(var e=0,o=0,i=[],n=0,l=u.rows[t];n<l.length;n++){var c=l[n];0<c&&(e+=c)}for(var s=!1,r=0,f=0,g=u.grid[t];f<g.length;f++)1===g[f]?(s=!0,r++,o++):s&&(i.push(r),r=0,s=!1);return s&&i.push(r),e<o?-65535:o<e?0:i.join("-")===u.rows[t].join("-")?65535:-65535},m=function(t){!function(t){for(var e=1,o=1,i=0,n=u.cols;i<n.length;i++){var l=n[i];l.length>e&&(e=l.length)}for(var c,s=0,r=u.rows;s<r.length;s++){var f=r[s];f.length>o&&(o=f.length)}t&&(c=(window.innerWidth-10)/(o+u.config.width),t=(window.innerHeight-10)/(e+u.config.height),u.config.scale=Math.floor(c<t?c:t),u.config.scale<5&&(u.config.scale=5)),u.config.xOffset=u.config.scale*o,u.config.yOffset=u.config.scale*e}(t),l.width=u.config.xOffset+u.config.width*u.config.scale,l.height=u.config.yOffset+u.config.height*u.config.scale,g.clearRect(0,0,l.width,l.height);for(var e=0;e<u.config.width;e++)y(e);for(var o=0;o<u.config.height;o++)p(o);h()},h=function(){for(var t=0;t<u.config.height;t++)for(var e=0;e<u.config.width;e++)O(e,t,u.grid[t][e])},y=function(t){var e=u.config.scale/2,o=u.config.yOffset-u.cols[t].length*u.config.scale+e,i=u.config.xOffset+t*u.config.scale+e;g.fillStyle=1&t?"#FFF":"#CCC",g.fillRect(i-e,0,u.config.scale,u.config.yOffset),g.font=.8*u.config.scale+"px Monospace",g.textAlign="center",g.textBaseline="middle";for(var n=0<u.status.cols[t]?"gray":"red",l=0<u.status.cols[t]?u.status.cols[t]:-u.status.cols[t],c=1,s=0,r=u.cols[t];s<r.length;s++){var f=r[s];g.fillStyle=l&c?n:"black",g.fillText(""+f,i,o),c*=2,o+=u.config.scale}},p=function(t){var e=u.config.scale/2,o=u.config.yOffset+t*u.config.scale+e,i=u.config.xOffset-u.rows[t].length*u.config.scale+e;g.fillStyle=1&t?"#FFF":"#CCC",g.fillRect(0,o-e,u.config.xOffset,u.config.scale),g.font=.8*u.config.scale+"px Monospace",g.textAlign="center",g.textBaseline="middle";for(var n=0<u.status.rows[t]?"gray":"red",l=0<u.status.rows[t]?u.status.rows[t]:-u.status.rows[t],c=1,s=0,r=u.rows[t];s<r.length;s++){var f=r[s];g.fillStyle=l&c?n:"black",g.fillText(""+f,i,o),c*=2,i+=u.config.scale}},O=function(t,e,o){if(t<0||e<0||t>=u.config.width||e>=u.config.height)throw new Error("Outside game-grid: "+JSON.stringify({x:t,y:e,type:o}));t=u.config.xOffset+t*u.config.scale,e=u.config.yOffset+e*u.config.scale;g.fillStyle="#808080",g.fillRect(t,e,u.config.scale,u.config.scale),g.fillStyle="#C0C0C0",g.fillRect(t,e,u.config.scale-1,u.config.scale-1),g.fillStyle="#404040",g.fillRect(t+1,e+1,u.config.scale-1,u.config.scale-1),g.fillStyle=o<0?"#808080":o?"black":"white",g.fillRect(t+1,e+1,u.config.scale-2,u.config.scale-2)},I=function(t){var e=Math.floor((t.clientX-u.config.xOffset)/u.config.scale),o=Math.floor((t.clientY-u.config.yOffset)/u.config.scale);if(e<0){if(o<0&&confirm("Reset game?"))return void m(!0);var i=u.rows[o].join(" "),n=prompt("Config row "+(1+o),i);if(null===n||i===n)return;if(""===n)return u.rows[o].length=0,void d(u);for(var l=[],c=0,s=0,r=n.split(/[ ,]+/g);s<r.length;s++){var f=r[s];0<(h=Math.floor(+f))&&l.push(h),c+=h}return l.length<1?(console.error("Invalid row: "+n),void alert("Invalid row: "+n)):c+l.length>u.config.width+1?(console.error("Invalid row-size: "+n),console.error({newList:l,width:u.config.width,sum:c,length:l.length,max:c+l.length-1}),void alert("Invalid row-size: "+n)):(u.rows[o]=l,d(u),u.status.rows[o]=w(o),void p(o))}if(o<0){i=u.cols[e].join(" "),n=prompt("Config col "+(1+e),i);if(null===n||i===n)return;if(""===n)return u.cols[e].length=0,void d(u);for(var l=[],c=0,g=0,a=n.split(/[ ,]+/g);g<a.length;g++){var h,f=a[g];0<(h=Math.floor(+f))&&l.push(h),c+=h}return l.length<1?(console.error("Invalid col: "+n),void alert("Invalid col: "+n)):c+l.length>u.config.height+1?(console.error("Invalid col-size: "+n),console.error(l),void alert("Invalid col-size: "+n)):(u.cols[e]=l,d(u),u.status.cols[e]=v(e),void y(e))}t=(1+u.grid[o][e]+(0<t.button?1:2))%3-1;u.grid[o][e]=t,d(u),O(e,o,t);t=v(e);u.status.cols[e]!==t&&(u.status.cols[e]=t,y(e));e=w(o);u.status.rows[o]!==e&&(u.status.rows[o]=e,p(o))};e=localStorage.getItem("width"),o=localStorage.getItem("height"),i=localStorage.getItem("game"),e&&(s.value=e),o&&(r.value=o),i&&(i=JSON.parse(i),f(i)),c.addEventListener("click",t,{once:!1,passive:!0}),l.addEventListener("click",I,{once:!1,passive:!0})},{once:!0,passive:!0});
//# sourceMappingURL=es5.js.map