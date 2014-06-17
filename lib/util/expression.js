var _ = require('lodash')
  , setCache = {}
  , getCache = {};

module.exports = {
	
	expr: expr,

	setter: function(path, safe, param){
		return setCache[path] || ( setCache[path] = new Function('data, value', expr(path, safe) + ' = value'))
	},

	getter: function(path, safe, param) {
		return getCache[path] || ( getCache[path] = new Function('data', "return " + expr(path, safe) ))
	}
}

function expr(expression, safe, param){
	expression = expression || ""
	
	if (typeof safe === 'string') {
        paramName = safe;
        safe = false;
    }

    param = param || 'data'

	if(expression && expression.charAt(0) !== '[')
		expression = '.' + expression

	return safe ? wrap(expression.split('.'), param) : param + expression 
}

function wrap (members, param) {
    var result = param
      , count = 1;

    result = _.reduce(members, function(result, member, idx){
    	var arrayIdx;

    	if(member !== ''){
    		arrayIdx = member.indexOf('[')

    		if( idx !== 0){
				member = arrayIdx === -1
					? '.' + member
					: (count++, "." + member.substring(0, arrayIdx) + " || {})" + member.substring(arrayIdx))
    			
                count++
    			result += member + ((idx < members.length - 1) ? " || {})" : ")")
    		}
    	}
        return result

    }, result)

    return new Array(count).join("(") + result;
}