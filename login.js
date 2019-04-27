
// 模块依赖
var connect = require('connect'),
users = require('./users');
var server = connect(
    connect.logger('dev'),
    connect.bodyParser(),
    // session中间件需要操作cookie,所以在这里引入cookieParser中间件
    connect.cookieParser(),
    connect.session({secret : 'my all secret'}),
    // 出于安全考录，在初始化session中间件的时候需要提供secret选项
    // 将车用户是否登录，若已登录展示欢迎，若未登录则交给其他中间件
    function(req,res,next){
        if('/'==req.url && req.session.logged_in){
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            res.end(
                '欢迎 <b>'+req.session.name + '</b>回来!' 
                + '<a href="/logout"></a>'
            );
        }else{
            next();
        }
    },
    // 若用户未登录，切请求地址是’/‘,则展示表单
    function(req,res,next){
        if('/'==req.url && 'GET'== req.method){
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            res.end([
                '<form action="/login" method="POST">',
                '<fieldset>',
                '<legend>请登录</legend>',
                '<p>用户名:<input type="text" name="user"/></p>',
                '<p>密码:<input type="password" name="password"/></p>',
                '<button>登录</button>',
                '</fieldset>',
                '</form>'
            ].join(''))
        }else{
            next();
        }
    },
    // 当提交表单时，若用户名密码错误则展示错误，否则展示成功
    function(req,res,next){
        if('/login'==req.url && 'POST'== req.method){
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            if(!users[req.body.user] || req.body.password != users[req.body.user].password){
                res.end('<p>用户名或密码错误<p>')
            }else{
                // 在这里修改req.session对象，该对象在响应发出去时自动保存，无须手动处理
                req.session.logged_in = true;
                req.session.name = users[req.body.user].name;
                res.end('<p>登陆成功<p>');
            }
            
        }else{
            next();
        }
    },
    // 若请求logout,则登出
    function(req,res,next){
        if('/logout'==req.url){
            req.session.logged_in = false;
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            res.end('<p>已退出<p>');
        }else{
            next();
        }
    },
);

server.listen(3000);