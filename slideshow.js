(function (){
   const defaultWaitTime = 5000;
   const keycodeMap = {left:37, up:38, right:39, down:40};
   var animating = false;

   function getImageLoader(imglist){
      var loading = false;
      function xhr(url, proc){
         if (!loading) {
            loading = true;
            r = new XMLHttpRequest();
            if (r) {
               r.onreadystatechange = function() {
                  if (r.readyState == 4 && r.status == 200) {
                     proc(r.responseText);
                     loading = false;
	              }
               };
               r.open("GET", url);
		       r.send(null);
            } else {
               alert("failed to create xmlhttprequest object");
            }
         }
      };
      function getContentImages(xpath, root) {
         imgs = document.evaluate(xpath, root, null, 7, null);
         for (var i=0,max=imgs.snapshotLength;i<max;i++) {
            imglist[imglist.length] = imgs.snapshotItem(i);
         }
      };


      var loaders = [];
      loaders["4u.straightline.jp"] = function(proc, current){
         page = ((typeof(page)=="undefined")?1:page);
         xhr("/?page="+page, function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//div[@class='entry-photo']/a/img", document);
            document.body.removeChild(div);
         });
      };
      loaders["www.pixiv.net"] = function(proc, current){
          page = ((typeof(page)=="undefined")?1:page);
          xhr("/index.php?s_mode=s_tag&word=%E3%82%A2%E3%83%8A%E3%83%AD%E7%86%8A&p="+page, function(text){
                  page++;
                  div = document.createElement('div');
                  div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//div[@id='illust_c5']/ul/li/a/img", document);
            document.body.removeChild(div);
              });
      };
      loaders[".*tumblr.*com"] = function(proc, current){
         page = ((typeof(page)=="undefined")?1:page);
         url  = ((typeof(url) =="undefined")?(function(){
            dirs = location.pathname.split('/');
            if (dirs[dirs.length-2] == 'page') {
               return dirs.slice(0,dirs.length-2).join('/');
            } else if (dirs[1] == 'post') {
               return "";
            } else {
               if (location.pathname == "/") {
                  return "";
               } else {
                  return location.pathname;
               }
            }
         })():url);

         xhr(url+"/page/"+page, function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//img", document);
            document.body.removeChild(div);
         });
      };
/*
      loaders["images.google.*"] = function(proc, current){
         page = ((typeof(page)=="undefined")?0:page);
         url  = ((typeof(url) =="undefined")?(function(){
            options = location.search.split('&');
            key = "";
            for (var i=0,max=options.length;i<max;i++){
               if (options[i].slice(0,2) == "q=") {
                  key = options[i].slice(2);
                  break;
               }
            }
            return "/images?hl=en&q="+key+"&sa=N&ndsp=20&start=";
         })():url);

         xhr(url+(page*20), function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            scripts = document.evaluate("//script",document, null, 7, null);
            head = document.getElementsByTagName('head')[0];
            for (var i=0,max=scripts.snapshotLength;i<max;i++){
               scr = document.createElement('script');
               scr.innerHTML = scripts.snapshotItem(i).innerHTML;
               head.appendChild(scr);
               head.removeChild(scr);
            }

            urls = document.evaluate("//table[@class='ts']"+
                                     "/tbody/tr/td/a/img",
                                     document, null, 7, null);
alert(urls.snapshotLength);
            for (var i=0,max=urls.snapshotLength;i<max;i++){
               newimg = document.createElement('img');
               newimg.href = 'http'+urls.split('http')[2];
               imglist[imglist.length] = newimg;
            }
            document.body.removeChild(div);
         });
      };
*/
      loaders["image.baidu.jp"] = function(proc, current){
         page = ((typeof(page)=="undefined")?1:page);
         url  = ((typeof(url) =="undefined")?(function(){
            options = location.search.split('&');
            key = "";
            for (var i=0,max=options.length;i<max;i++){
               if (options[i].slice(0,5) == "word=") {
                  key = options[i].slice(5);
                  break;
               }
            }
            return "/i"+"?ct=201326592&lm=-1&word="+key+"&z=0&sa=0&sf=0&st=40&tn=baiduimage&pn=32&cl=2&pg=";
         })():url);

         xhr(url+page, function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//a[@class='imgbox']/img", document);
            document.body.removeChild(div);
         });
      };
      loaders["okinny.heypo.net"] = function(proc, current){
         page = ((typeof(page)=="undefined")?1:page);
         url  = ((typeof(url) =="undefined")?(function(){
            dirs = location.pathname.split('/');
            if (dirs[dirs.length-2] == 'page') {
               return dirs.slice(0,dirs.length-2).join('/');
            } else {
               if (location.pathname == "/") {
                  return "";
               } else {
                  return location.pathname;
               }
            }
         })():url);

         xhr(url+"/page/"+page, function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//div[@class='img']/a/img", document);
            document.body.removeChild(div);
         });
      };


      for (key in loaders) {
         if ( location.host.search(new RegExp(key)) != -1 ) {
            return loaders[key];
         }
      }
      return (function(){});
   };

   var ContentsContainer = function() {
      imglist = [];
      current = -1;
      loader = getImageLoader(imglist);

      this.getNext = function(proc){
         proc = proc || (function(){});
         if (current > imglist.length-10) {
            loader(proc, current);
         }
         if (current+1 < imglist.length) {
            proc(imglist[++current]);
            if (current - 10 > 0) {
               imglist[current-10] = undefined;
            }
         }
      };
      this.getPrevious = function(proc) {
         proc = proc || (function(){});
         if (current > 0 && imglist[current-1]) {
            proc(imglist[--current]);
         }
      };
   };

   var AutoScroller = function (container, waitTime){
      wait = waitTime;
      alreadyExist = false;
      autoscrolling = false;
      this.start = function(){
         if (!alreadyExist) {
            autoscrolling = true;
            alreadyExist = true;
            scroll();
         }
      };
      this.stop = function(){
         autoscrolling = false;
      };
      this.changeWait = function(waitTime) {
         wait = waitTime;
      }
      function scroll(){
         if (autoscrolling) {
            container.getNext(changeImg);
            setTimeout(arguments.callee, wait);
         } else {
            alreadyExist = false;
         }
      };
   };

   function changeImg(img){
      function animate() {
         if ( parseFloat(img.style.opacity) < 1 ) {
            img.style.opacity =
               (parseFloat(img.style.opacity) + 0.2).toString();
            setTimeout(animate, 40);
         } else {
            ia = document.getElementById('imagearea');
            if (ia.childNodes.length > 1) {
               ia.removeChild(ia.firstChild);
            }
            animating = false;
         }
      };

      img.style.position = "absolute";
      img.style.margin = "0px";
      img.style.width = "100%";
      img.style.opacity = 0;
      document.getElementById('imagearea').appendChild(img);
      setTimeout(animate, 40);
      animating = true;
   };


   var container = new ContentsContainer();
   var scroller = new AutoScroller(container, defaultWaitTime);

   /* remove element */
   head = document.getElementsByTagName('head')[0];
   while (head.childNodes.length != 0) {
      head.removeChild(head.firstChild);
   }
   while (document.body.childNodes.length != -0) {
      document.body.removeChild(document.body.firstChild);
   }
   
   /* prepare new page */
   document.body.width = "100%";
   document.body.height = "1372px";
   document.body.style.margin = "0px";

   var mainwindow = document.createElement('div');
   mainwindow.id = "imagearea";
   mainwindow.style.width = "100%";
   mainwindow.style.height = "1372px";
   document.body.appendChild(mainwindow);
   h2 = document.createElement('h2');
   h2.innerText = "Loading...";
   mainwindow.appendChild(h2);
   
   /* prepare menu */
   var menu = document.createElement('div');
   menu.id = 'menu';
   menu.style.position = 'absolute';
   menu.style.top = '0px';
   menu.style.margin = '0px';
   menu.style.width = '100%';
   menu.style.height = '150px';
   menu.style.backgroundColor = 'gray';
   menu.style.zIndex = '100';
   menu.style.opacity = 0.8;
   menu.style.display = 'none';
   /* play button */
   var play = document.createElement('a');
   play.innerText = "play";
   play.style.margin = '10px';
   play.style.fontSize = '50pt';
   play.addEventListener('click', function(e) {
      scroller.start();
      menu.style.display = 'none';
   }, true);
   menu.appendChild(play);
   /* textbox for wait time */
   var waitSelect = document.createElement('select');
   waitSelect.style.fontSize = "50pt";
   waitSelect.innerHTML =
      "<option value='slow'>10sec</option>"+
      "<option value='normal' selected='true'>5sec</option>"+
      "<option value='fast'>3sec</option>";
   menu.appendChild(waitSelect);
   waitSelect.addEventListener('change', function(e){
      e.stopPropagation();
      switch (waitSelect.selectedIndex) {
         case 0: scroller.changeWait(10000); break;
         case 1: scroller.changeWait(5000);  break;
         case 2: scroller.changeWait(3000);  break;
      }
      scroller.start();
      menu.style.display = 'none';
      setTimeout(scrollTo, 100, 0, 1);      
   }, true);

   document.body.appendChild(menu);
   mainwindow.addEventListener('click', function(e) {
      scroller.stop();
      if (!animating) {
         if (e.y < 100) {
            menu.style.display = 'block';
            setTimeout(function(){
               menu.style.display = 'none';
            }, defaultWaitTime);
         } else {
            menu.style.display = 'none';
            if (e.x < document.body.clientWidth / 2) {
               container.getPrevious(changeImg);
            } else {
               container.getNext(changeImg);
            }
         }
      }
   }, true);

   /* start slideshow */
   scroller.start();
   setTimeout(scrollTo, 100, 0, 1);
})()
