module.exports = function (host='', statsigDemoClientKey = '') { 
  return `<!DOCTYPE html>
  <head>
      <meta charset="UTF-8">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js" integrity="sha512-8RnEqURPUc5aqFEN04aQEiPlSAdE0jlFS/9iGgUyNtwFnSKCXhmB6ZTNl7LnDtDWKabJIASzXrzD0K+LYexU9g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/javascript/javascript.min.js" integrity="sha512-I6CdJdruzGtvDyvdO4YsiAq+pkWf2efgd1ZUSK2FnM/u2VuRASPC7GowWQrWyjxCZn6CT89s3ddGI+be0Ak9Fg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <link rel="icon" type="image/png" href="https://statsig.com/images/icons/statsig_32x.png" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.css" integrity="sha512-uf06llspW44/LZpHzHT6qBOIVODjWtv4MxCricRxkzvopAlSWnTf6hpZTFxuuZcuNE9CBQhqE0Seu1CoRk84nQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">  
      <script src="https://cdn.jsdelivr.net/npm/statsig-js/build/statsig-prod-web-sdk.min.js"></script>
      <script data-codemirror="editor">   
      const initSS = async() => {    
        await statsig.initialize('${statsigDemoClientKey}', {
              userID: 'another-user',
              custom: {
                credit_card_no: '3712-402791-32998',
                social_sec_no: '155-97-3432',
                phone_number: '732-740-6789',                
                tier: 'gold'
              }
          },{          
            environment: { tier: 'production' }, 
            api: '${host}',
            loggingIntervalMillis: 0, 
            initTimeoutMs: 10000
          }
        );              
      };
      window.onload = initSS;   
      </script>
  </head>
  <body>    

      <div class="container mt-5">
          <div class="row">
            <h2>Hey, this is a proxy! Here's how you can use it.</h1><hr />
            <div class="col-6 overflow-auto">
              <div id="editor"></div>
            </div>
            <div class="col-6">
              <b>Sample Client Code</b>
              <p>Override the api initialization option with your worker URL</p>
            </div>
        </div>
      </div>        
      
  <script>
  function cleanse(s, encode) {    
      var clean = !encode ? s : s.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");    
      clean = clean.replace(/^\s+\\n/g, '');
      return clean;
  }   
  function showCode(code, eltId, type) {
      var cm = CodeMirror(document.getElementById(eltId), {
          value: code,
          mode: type,
          indentUnit: 2,
          lineNumbers: true,
          readOnly: true
      });
      cm.setSize(null, '100%');
  }
  document.querySelectorAll('script[data-codemirror]').forEach(node => {
      window.cp = node.innerText;
      showCode(cleanse(node.innerText), node.dataset.codemirror, 'javascript');
  });

  var broom = document.createElement('span');
      broom.innerText = '🗑';
      broom.style.cssText = 'position:fixed;top:10px;right:10px;cursor:pointer';
      broom.addEventListener('click', function() { for(var k in localStorage) if(k.includes('STATSIG_')) { localStorage.removeItem(k); }; window.location=window.location; });
      document.body.appendChild(broom);
  </script>

  </body>
  </html>`;
};