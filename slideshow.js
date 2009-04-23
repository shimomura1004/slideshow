(function (){
   const keycodeMap = {left:37, up:38, right:39, down:40};
   var lock = false;

   /* load images beyond pages */
   function contentsLoader(set) {
      var loading = false;
      var imglist = [];
      getContentImages(set.xpath, document);

      var current = -1;
      var page    = 1;

      function getContentImages(xpath, root) {
         imgs = document.evaluate(xpath, root, null, 7, null);
         for (var i=0,max=imgs.snapshotLength;i<max;i++) {
            imglist[imglist.length] = imgs.snapshotItem(i);
         }
      };

      function addElements(proc) {
         loading = true;
         r = new XMLHttpRequest();
         if (r) {
            r.onreadystatechange = function() {
               if (r.readyState == 4 && r.status == 200) {
                  div = document.createElement('div');
                  div.style.display = "none";
                  div.innerHTML = r.responseText;
                  document.body.appendChild(div);
                  getContentImages(set.xpath, document);
                  document.body.removeChild(div);
                  loading = false;
                  proc(imglist[++current]);
	           }
            };
            r.open("GET", set.pager+(++page));
		    r.send(null);
         } else {
            alert("failed to create xmlhttprequest object");
         }
      }

      this.getNext = function(proc) {
         proc = proc || (function(){});
         
         if (current > imglist.length-10 && !loading) {
            /* load new page */
            addElements(function(){});
         }
         if (current+1 < imglist.length) {
            proc(imglist[++current]);
            if (current - 10 > 0) {
               /* remove old images */
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

   function getLocationSet(location){
      var locations = [];
      locations["4u.straightline.jp"] = {
         xpath : "//div[@class='entry-photo']/a/img",
         pager : "./?page="
      };
      locations["www.flickr.com"] = {
         xpath : "//img[@class='pc_img']",
         pager : "./search/?q=westie&s=int&page="
      };
      locations["okinny.heypo.net"] = {
         xpath : "//div[@class='img']/a/img",
         pager : "./page/"
      };
      locations["okinny.tumblr.com"] = {
         xpath : "//div[@class='photo']/a/img",
         pager : "./page/"
      };
      return locations[location] || {xpath:"//img", pager:"./?page="};
   };




   var contents = new contentsLoader(getLocationSet(location.host));


   function prepareSlideShowPage(){
      function removeOriginalElements(){
         head = document.getElementsByTagName('head')[0];
         while (head.childNodes.length != 0) {
            head.removeChild(head.firstChild);
         }
         while (document.body.childNodes.length != -0) {
            document.body.removeChild(document.body.firstChild);
         }
      };
      removeOriginalElements();

      function prepareNewPage(){
         document.body.width = "100%";
         document.body.height = "1372px";
         document.body.style.margin = "0px";
         
         var container = document.createElement('div');
         container.id = "imagearea";
         container.style.width = "100%";
         container.style.height = "1372px";
         document.body.appendChild(container);
         container.appendChild(document.createElement('img'));
         
         container.addEventListener('click', function(e) {
            if (!lock) {
               if (e.x < document.body.clientWidth / 2) {
                  contents.getPrevious(changeImg);
               } else {
                  contents.getNext(changeImg);
               }
            }
         }, true);
      };
      prepareNewPage();
   };
   prepareSlideShowPage();

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
            lock = false;
         }
      }

      img.style.position = "absolute";
      img.style.margin = "0px";
      img.style.width = "100%";
      img.style.opacity = 0;
      document.getElementById('imagearea').appendChild(img);
      setTimeout(animate, 40);
      lock = true;
   }

   contents.getNext(changeImg);

   setTimeout(scrollTo, 100, 0, 1);
})()
