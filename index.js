import express from 'express'
import {Server} from 'socket.io'
import {createServer} from 'http'
import mongoose from 'mongoose'
import room from './model.js'
import bodyParser from 'body-parser'
import url from 'url'
import bcrypt from 'bcryptjs'
import path from 'path'


import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const salt_factor=10
const app=express()
app.set('view engine','ejs')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use([

    bodyParser.json({ limit: '30mb', extended: true}),
]);

var server=createServer(app)

var io=new Server(server)




app.get('/',(req,res)=>{
	res.render('pages/index')
})


app.post('/',async(req,res)=>{
	if(req.body.htmladmin==1){
			var obj=await room.findById(req.body.roomid)
			await obj.remove()
			return res.redirect(url.format({
				pathname:'/',
			}))
		}
		else{
			return res.redirect(url.format({
				pathname:'/',
			}))
		}
})


mongoose.connect('mongodb://localhost:27017/mydb',(err)=>{
	if(!err) console.log('Connected to db')
	else console.log(err);
})




app.post('/createroom',async (req,res)=>{

if(req.body.pass!=null){
try{
		var salt=await bcrypt.genSalt(salt_factor)
		var hashpass=await bcrypt.hash(req.body.pass,salt)
		
	}
	catch(err){
		res.send("hi");
	}

	var username=req.body.username
	var alreadythere=await room.findOne({'admin':username})
	if(alreadythere==null){
		const obj=new room({
			'pass':hashpass,
			'admin':req.body.username,
		})
		try{
			var roomid_first=String(obj._id)
			obj.save()
			res.render('pages/room.ejs', {
            'roomid':roomid_first,
            'admin':1,
            'username':username,
          
        });
			
		}
		catch(err){
			console.log(err)
		}
	}else{
		var roomid_first=String(alreadythere._id)
			res.render('pages/room.ejs', {
            'roomid':roomid_first,
            'admin':1,
            'username':username,
          
        });
	}
	
	}
	
});

app.post('/joinroom',async (req,res)=>{
	var obj=await room.findById(req.body.roomid)
	if(obj==null){
		res.send('no room')
	}
	else{
		var roomid_first=req.body.roomid
		var pass=req.body.pass
		var username=req.body.username


	

	
	if(pass!=null){



		bcrypt.compare(pass,obj.pass,(err,result)=>{
			if(result){
				// return res.redirect(url.format({
				// 	pathname:'/room',
					
				// }))

				res.render('pages/room.ejs', {
            'roomid':roomid_first,
            'username':username,
            'admin':0
        });


			}
			else{
				res.send('wrong pass')
			}
		})
	}
		
	}
})


async function chatfun(roomid_out,msgvalue_out,name,res){
	var obj=await room.findById(roomid_out)
	
	if(obj!=null){

	var msgstr=String(name+"!"+msgvalue_out)
	obj.messages.push(msgstr)
	obj.save()
	var msgs=obj.messages
	return msgs
}
else{
	return null;
}

}


app.post('/allmsgs',async(req,res)=>{
	var roomid_out=String(req.body.roomid);
	var obj=await room.findById(roomid_out)
	var allmsgs=obj.messages

	if(allmsgs!=null){
		res.json({'allmsgs':allmsgs})
	}
	else{
		res.send('error')
	}
})



app.post('/room',async (req,res)=>{
	var roomid_out=String(req.body.roomid);
	var msgvalue_out=req.body.msg;
	var username=req.body.username;
	var allmsgs=await chatfun(roomid_out,msgvalue_out,username,res)
	if(allmsgs!=null){
		res.json({'msg':'success'})
	}
	else{
		res.send('error')
	}
	
})

server.listen(3000,(err)=>{
	if(!err)
	console.log("listening @ 3000");
else{
	console.log("there is error");
}

})