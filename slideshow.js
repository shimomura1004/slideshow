(function (){
   const waitTime = 5000;
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
         xhr("./?page="+page, function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//div[@class='entry-photo']/a/img", document);
            document.body.removeChild(div);
         });
      };
      loaders["okinny.heypo.net"] = function(proc, current){
         page = ((typeof(page)=="undefined")?1:page);
         xhr("./?page="+page, function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//div[@class='img']/a/img", document);
            document.body.removeChild(div);
         });
      };
      loaders[".*tumblr.com"] = function(proc, current){
         page = ((typeof(page)=="undefined")?1:page);
         xhr("./?page="+page, function(text){
            page++;
            div = document.createElement('div');
            div.style.display = "none";
            div.innerHTML = text;
            document.body.appendChild(div);
            getContentImages("//div[@class='photo']/a/img", document);
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

   var AutoScroller = function (container, wait){
      alreadyExist = false;
      autoscrolling = false;
      this.start = function(){
         if (!alreadyExist) {
            autoscrolling = true;
            alreadyExist = true;
            container.getNext(changeImg);
            scroll();
         }
      };
      this.stop = function(){
         autoscrolling = false;
      };
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
   var scroller = new AutoScroller(container, waitTime);

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
   menu.style.backgroundColor = 'gray';
   menu.style.zIndex = '100';
   menu.style.opacity = 0.8;
   menu.style.display = 'none';
   var play = document.createElement('a');
   play.innerText = "play";
   play.style.margin = '10px';
   play.style.fontSize = '50pt';
   menu.appendChild(play);
   document.body.appendChild(menu);

   play.addEventListener('click', function(e) {
      scroller.start();
      menu.style.display = 'none';
   }, true);
   mainwindow.addEventListener('click', function(e) {
      scroller.stop();
      if (!animating) {
         if (e.y < 50) {
            menu.style.display = 'block';
            setTimeout(function(){
               menu.style.display = 'none';
            }, waitTime);
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
