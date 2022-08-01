function Validator(options){

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) return element.parentElement;
            element = element.parentElement
        }
    }

    var selectorRules = {}

    function Validate(inputElement, rule){
        //inputElement.value
        //rule.test()

        var errorElement = getParent(inputElement, options.formGroupElement).querySelector(options.errorSelector)
        var errorMsg;

        var rules = selectorRules[rule.selector]
        for (var i=0; i<rules.length; ++i){
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    //????????.value
                    
                    errorMsg = rules[i](formElement.querySelector(rule.selector+ ':checked'))
                    
                    break;
                default:
                    errorMsg = rules[i](inputElement.value)
            }
            if(errorMsg) break;
        }
        
        if(errorMsg) {
            errorElement.innerText = errorMsg
            getParent(inputElement, options.formGroupElement).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupElement).classList.remove('invalid')
        }
        return !errorMsg;
    }

    var formElement = document.querySelector(options.form);
    if(formElement) {
        // var isFormValid = true; WHY ĐỂ NGOÀI, KHI CHẠY HÀM BÊN DƯỚI
        // isFormValid LUÔN = FALSE??

        //lắng nghe, prevent sự kiện submit form và validate lại các input
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if(!isValid) isFormValid = false;
            })

            if(isFormValid) {
                // xử lý submit form bằng Javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value;
                        return values;
                    }, {})

                    options.onSubmit(formValues);
                }
                // xử lý submit form theo mặc định
                else {
                    formElement.submit()
                }
            }             
        }

        //lặp qua mỗi rule và lắng nghe sự kiện
        options.rules.forEach(function(rule){
            //lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector);

            if(inputElement){
                inputElement.onblur = function() {
                    Validate(inputElement, rule);
                }

                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupElement).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupElement).classList.remove('invalid')
                }
            }
        })
    }
}

Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value){
            //trim()
            return value ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email!'
        }
    }
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự!`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không đúng!'
        }
    }
}