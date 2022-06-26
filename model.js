import mongoose from 'mongoose'

const Schema=mongoose.Schema

const rooms=new Schema({
	'pass':{
		type:String
	},
	'admin':{
		type:String
	},
	
	'toc':{
		type:Date,
		default:Date.now
	},
	'messages':{
		type:[String],
	}

})

const room=mongoose.model('rooms',rooms)

export default room