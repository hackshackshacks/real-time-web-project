(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){var app={elements:{wrap:document.querySelector("#wrap"),photo:document.querySelector("#imageWrap"),time:document.querySelector("#time"),tags:document.querySelector("#tags"),players:document.querySelector("#players"),guessForm:document.forms["guessForm"],nameForm:document.forms["nameForm"]},init:function(){connect.init();this.handleEvents()},handleEvents:function(){this.elements.nameForm.addEventListener("submit",function(e){e.preventDefault();connect.socket.emit("name",this["name"].value)});this.elements.guessForm.addEventListener("submit",function(e){e.preventDefault();if(this["guess"].value){connect.socket.emit("guess",this["guess"].value);this["guess"].value=""}})}};var connect={socket:io(),init:function(){this.handleEvents()},handleEvents:function(){this.socket.on("photo",function(photo){helper.replaceHTML(app.elements.photo,'<img src="'+photo+'">')});this.socket.on("time",function(time){helper.replaceHTML(app.elements.time,time)});this.socket.on("tags",function(tags){var list="<ul>";tags.forEach(function(tag){list+="<li>"+tag+"</li>"});list+="</ul>";helper.replaceHTML(app.elements.tags,list)});this.socket.on("players",function(players){var list="";players.forEach(function(player){list+="<li>"+player.username+"<span>:"+player.score+"</span></li>"});helper.replaceHTML(app.elements.players,list)});this.socket.on("gameState",function(state){if(state){app.elements.wrap.dataset.active=true}else{app.elements.wrap.dataset.active=false}})}};var helper={emptyElement:function(element){while(element.firstChild){element.removeChild(element.firstChild)}},replaceHTML:function(element,string){this.emptyElement(element);element.insertAdjacentHTML("beforeend",string)}};app.init()},{}]},{},[1]);
