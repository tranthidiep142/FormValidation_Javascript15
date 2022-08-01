function Validator(formSelection, options = {}) {
    var formRules = {}
    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này!'
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email!'
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự!`
            }
        }
    }

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) return element.parentElement;
            element = element.parentElement;
        }
    }

    var rules
    function handleValidate(e) {
        formGroupElement = getParent(e.target, '.form-group')
        rules = formRules[e.target.name]

        for(var rule of rules) {
            var errorMsg = rule(e.target.value)
            if(errorMsg) {
                isValid = false
                break;
            } 
        }

        if(errorMsg) {
            formGroupElement.querySelector('.form-message').innerText = errorMsg
            formGroupElement.classList.add('invalid')
        }
        return !errorMsg
        //!underfined => true, !(có errMsg) => false
    }

    function handleClearError(e) {
        formGroupElement = getParent(e.target, '.form-group')
        formGroupElement.querySelector('.form-message').innerText = ''
        if(formGroupElement.classList.contains('invalid')) formGroupElement.classList.remove('invalid')
    }

    var formElement = document.querySelector(formSelection)

    if(formElement) {
        // var isValid = true
        var inputElements = formElement.querySelectorAll('[name][rules]')

        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isValid = true
            for(var input of inputElements) {
                if(!handleValidate({target: input})) isValid = false
            }

            //khi k có lỗi nào thì lấy value ra để call API
            var formValues
            if(isValid) {
                if(typeof options.onSubmit === 'function') {
                    formValues = Array.from(inputElements).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values
                    }, {})
                    options.onSubmit(formValues)
                } else {
                    formElement.submit()
                } 
            }
        }
        
        Array.from(inputElements).forEach(function(input) {
            rules = input.getAttribute('rules').split('|')
            for(var rule of rules) {
                var ruleFunc
                var ruleHasValue = rule.includes(':')
                if(ruleHasValue) {
                    var ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                    ruleFunc = validatorRules[rule](ruleInfo[1])
                } else {
                    ruleFunc = validatorRules[rule]
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            //lặp qua từng input và lắng nghe sự kiện
            // formGroupElement = getParent(e.target, '.form-group')

            input.onblur = handleValidate
            input.oninput = handleClearError
        })
    }
}