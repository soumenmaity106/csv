var mongoose = require('mongoose');
 
var courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,    
    course_id:String,
    course_name:String,
    course_fees:String,
    faculty_name:String,
});
 
var Course= mongoose.model('Course', courseSchema);
 
module.exports = Course;