
module.exports = ActionListener

function ActionListener(types, handler){
	this.handler = handler;
	this.types = types;
}