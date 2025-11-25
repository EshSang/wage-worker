function Validation(values){
    let errors = {}
    const email_pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/
    const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if(values.email === ""){
        errors.email = "Name should not be empty"
    } 
    else if (!email_pattern.test(values.email)){
        errors.email = "Emails didn't match"
    }
    else{
        errors.email = ""
    }

    if(values.password === ""){
        errors.password = "Password should not be empty"
    }
    else if (!password_pattern.test(values.password)){
        errors.password = "Password didn't match"
    }
    else{
        errors.password = ""
    }
    return errors;
}


export default Validation;