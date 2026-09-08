import mongoose, { type Model } from 'mongoose'; const { Schema, model, models } = mongoose;
interface Doc{name:string;email:string;message:string;status:'new'|'read'|'archived'}
const schema=new Schema<Doc>({name:{type:String,required:true,trim:true,maxlength:80},email:{type:String,required:true,trim:true,lowercase:true,maxlength:160},message:{type:String,required:true,trim:true,maxlength:2000},status:{type:String,enum:['new','read','archived'],default:'new'}},{timestamps:true});
export const ContactMessage=(models.ContactMessage as Model<Doc>)??model<Doc>('ContactMessage',schema);
