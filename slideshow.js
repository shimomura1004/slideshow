(function (){
   const defaultWaitTime = 5000;
   const keycodeMap = {left:37, up:38, right:39, down:40};
   var fading = false;
   var shouldFade = false;

   function getImageLoader(imglist){
      var loading = false;

      function xhr(dir, proc){
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
               r.open("GET", dir);
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
         if (page == 1) {
            getContentImages("//div[@class='entry-photo']/a/img",
                             document);
            page++;
         } else {
            xhr("/?page="+page, function(text){
               page++;
               div = document.createElement('div');
               div.style.display = "none";
               div.innerHTML = text;
               document.body.appendChild(div);
               getContentImages("//body//div[@class='entry-photo']/a/img",
                                document);
               document.body.removeChild(div);
            });
         }
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

         if (page == 1) {
            getContentImages("//div[@class='img']/a/img", document);
            page++;
         } else {
            xhr(url+"/page/"+page, function(text){
               page++;
               div = document.createElement('div');
               div.style.display = "none";
               div.innerHTML = text;
               document.body.appendChild(div);
               getContentImages("//body//div[@class='img']/a/img",
                                document);
               document.body.removeChild(div);
            });
         }
      };
      loaders[".*"] = function(proc, current){
         isFirst = ((typeof(isFirst)=="undefined")?true:isFirst);
         if (isFirst) {
            xhr(location.pathname, function(text){
               div = document.createElement('div');
               div.style.display = "none";
               div.innerHTML = text;
               document.body.appendChild(div);
               getContentImages("//img", document);
               document.body.removeChild(div);
            });
            isFirst = false;
         }
      };

      for (key in loaders) {
         if ( location.host.search(new RegExp(key)) != -1 ) {
            return loaders[key];
         }
      }
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
      function fade() {
         if ( parseFloat(img.style.opacity) < 1 ) {
            img.style.opacity =
               (parseFloat(img.style.opacity) + 0.2).toString();
            setTimeout(fade, 40);
         } else {
            ia = document.getElementById('imagearea');
            if (ia.childNodes.length > 1) {
               ia.removeChild(ia.firstChild);
            }
            fading = false;
         }
      };

      switch (window.orientation) {
         case 0:
            img.style.width = "100%";
            break;
         case 90: case -90: default:
            img.style.height = "100%";
            break;
      }
      img.style.position = "absolute";
      img.style.margin = "0px";
      document.getElementById('imagearea').appendChild(img);
      
      if(shouldFade) {
         img.style.opacity = 0;
         setTimeout(fade, 40);
         fading = true;
      } else {
         ia = document.getElementById('imagearea');
         if (ia.childNodes.length > 1) {
            ia.removeChild(ia.firstChild);
         }
      }
   };


   var container = new ContentsContainer();
   var scroller = new AutoScroller(container, defaultWaitTime);

   head = document.getElementsByTagName('head')[0];
   previousHead = document.createElement('div');
   previousHead.style.display = 'none';
   while (head.childNodes.length != 0) {
      node = head.firstChild;
      head.removeChild(node);
      previousHead.appendChild(node);
   }
   previousBody = document.createElement('div');
   previousBody.style.display = 'none';
   while (document.body.childNodes.length != 0) {
      node = document.body.firstChild;
      document.body.removeChild(node);
      previousBody.appendChild(node);
   }
   document.getElementsByTagName('html')[0].appendChild(previousHead);
   document.getElementsByTagName('html')[0].appendChild(previousBody);

//   document.body.appendChild(previousHead);
//   document.body.appendChild(previousBody);
 
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
   menu.style.textAlign = 'center';
   menu.style.margin = '0px';
   menu.style.width = '100%';
   menu.style.height = '150px';
   menu.style.backgroundColor = 'gray';
   menu.style.zIndex = '100';
   menu.style.opacity = 0.8;
   menu.style.display = 'none';
   /* play button */
   var play = document.createElement('button');
   play.type = 'button';
   play.innerText = "Play";
   play.style.fontSize = '50pt';
   play.style.marginTop = '10px';
   play.addEventListener('click', function(e) {
      scroller.start();
      menu.style.display = 'none';
      setTimeout(scrollTo, 100, 0, 1);
   }, true);
   menu.appendChild(play);
   /* selectbox for wait time */
   var waitSelect = document.createElement('select');
   waitSelect.style.fontSize = "50pt";
   waitSelect.innerHTML =
      "<option value='slow'>10sec</option>"+
      "<option value='normal' selected='true'>5sec</option>"+
      "<option value='fast'>3sec</option>";
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
   menu.appendChild(waitSelect);
   /* selectbox for fade/nowait */
   var fadeSelect = document.createElement('select');
   fadeSelect.style.fontSize = "50pt";
   fadeSelect.innerHTML =
      "<option value='nowait' selected='true'>NoWait</option>"+
      "<option value='fade'>Fade</option>";
   fadeSelect.addEventListener('change', function(e){
      e.stopPropagation();
      if (fadeSelect.selectedIndex == 0) {
         shouldFade = false;
      } else {
         shouldFade = true;
      }
      scroller.start();
      menu.style.display = 'none';
      setTimeout(scrollTo, 100, 0, 1);
   }, true);
   menu.appendChild(fadeSelect);

   document.body.appendChild(menu);
   mainwindow.addEventListener('click', function(e) {
      scroller.stop();
      if (!fading) {
         if (e.y < 150) {
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

   document.addEventListener('orientationchange', function(e){
      setTimeout(scrollTo, 100, 0, 1);
   }, true);

   /* start slideshow */
   scroller.start();
   setTimeout(scrollTo, 100, 0, 1);
})()
