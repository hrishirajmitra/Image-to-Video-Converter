document.addEventListener('DOMContentLoaded', function() {
    const loginFormId = document.getElementById('loginForm');
    const registerFormId = document.getElementById('registerForm');
    const loginSwitchFormId = document.querySelector('.loginSwitch');
    const registerSwitchFormId = document.querySelector('.registerSwitch');
    const toggleLoginPasswordId = document.getElementById('toggleLoginPassword');
    const toggleRegisterPasswordId = document.getElementById('toggleRegisterPassword');

    const usernameUniqueDiv = document.getElementById('register-username-unique');
    const usernameLengthDiv = document.getElementById('register-username-length');
    const usernameAdminDiv = document.getElementById('register-username-admin');
    const emailLengthDiv = document.getElementById('register-email-length');
    const emailVerifyDiv = document.getElementById('register-email-authentication');
    const nameLengthDiv = document.getElementById('register-name-length');
    const passwordLengthDiv = document.getElementById('register-password-length');
    const passwordNumberDiv = document.getElementById('register-password-number');
    const passwordCapitalDiv = document.getElementById('register-password-capital');
    const passwordSpecialDiv = document.getElementById('register-password-special');
    const noSpaceDiv = document.getElementById('register-no-space');

    const loginPageWithoutErrorHeight = '320px';
    const loginPageWithErrorHeight = '340px';

    const conditionListIds = [
        'register-username-unique',
        'register-username-length',
        'register-username-admin',
        'register-email-length',
        'register-email-authentication',
        'register-name-length',
        'register-password-length',
        'register-password-number',
        'register-password-capital',
        'register-password-special',
        'register-no-space'
    ];

    const registerPageHeightList = [
        '505px', '523px', '541px', '559px', '577px', '595px', '613px', '631px', '649px', '667px', '685px', '703px', '721px'
    ];

    let registerPageConditionsIndex = 0;
    let registerPageHeight = registerPageHeightList[registerPageConditionsIndex];
    for(let i = 0; i <= Math.min(registerPageConditionsIndex, conditionListIds.length - 1); i++) {
        document.getElementById(conditionListIds[i]).style.display = 'block';
    }
    for(let i = registerPageConditionsIndex + 1; i < conditionListIds.length; i++) {
        document.getElementById(conditionListIds[i]).style.display = 'none';
    }

    let errorMessageShown = false;

    loginFormId.addEventListener('submit', function(event) {
        event.preventDefault();
        loginForm();
    });

    registerFormId.addEventListener('submit', function(event) {
        event.preventDefault();
        registerForm();
    });

    loginSwitchFormId.addEventListener('click', function(event) {
        if(event.target.id === 'switchForm') {
            event.preventDefault();
            switchForm();
        }
    });

    registerSwitchFormId.addEventListener('click', function(event) {
        if(event.target.id === 'switchForm') {
            event.preventDefault();
            switchForm();
        }
    });

    toggleLoginPasswordId.addEventListener('click', function () {
        togglePasswordVisibility('login-password', 'toggleLoginPassword');
    });
    
    toggleRegisterPasswordId.addEventListener('click', function () {
        togglePasswordVisibility('register-password', 'toggleRegisterPassword');
    });

    function showLoginErrorMessage() {
        if(errorMessageShown === true) return;
        errorMessageShown = true;
        const errorDiv = document.getElementById('invalid-username');
        errorDiv.style.display = 'block';
        document.getElementById('container').style.height = loginPageWithErrorHeight;
    }

    function loginForm() {
        const loginFormUsername = document.getElementById('login-username').value;
        const loginFormPassword = document.getElementById('login-password').value;
        if(loginFormUsername !== '' && loginFormPassword !== '') {
            fetch('/api/LoginUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username: loginFormUsername, password: loginFormPassword}),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    if(response.url === window.location.href) {
                        showLoginErrorMessage();
                    }
                    else {
                        window.location.href = response.url;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    function changeRegisterColor(color) {
        usernameUniqueDiv.style.color = color;
        usernameLengthDiv.style.color = color;
        usernameAdminDiv.style.color = color;
        emailLengthDiv.style.color = color;
        emailVerifyDiv.style.color = color;
        nameLengthDiv.style.color = color;
        passwordLengthDiv.style.color = color;
        passwordNumberDiv.style.color = color;
        passwordCapitalDiv.style.color = color;
        passwordSpecialDiv.style.color = color;
        noSpaceDiv.style.color = color;
    }

    function registerForm() {
        const registerFormUsername = document.getElementById('register-username').value;
        const registerFormEmail = document.getElementById('register-email').value;
        const registerFormName = document.getElementById('register-name').value;
        const registerFormPassword = document.getElementById('register-password').value;

        if(registerFormUsername !== '' && registerFormPassword !== '' && registerFormEmail !== '' && registerFormName !== '') {
            fetch('/api/RegisterUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username: registerFormUsername, email: registerFormEmail, name: registerFormName, password: registerFormPassword}),
            })
                .then(response => response.json())
                .then(data => {
                    if(data.success) {
                        switchForm();
                        loginFormId.reset();
                    }
                    else {
                        usernameUniqueDiv.style.color = (data.usernameUnique) ? 'white' : 'red';
                        usernameLengthDiv.style.color = (data.usernameLength) ? 'white' : 'red';
                        usernameAdminDiv.style.color = (data.usernameAdmin) ? 'red' : 'white';
                        emailLengthDiv.style.color = (data.emailLength) ? 'white' : 'red';
                        emailVerifyDiv.style.color = (data.emailVerify) ? 'white' : 'red';
                        nameLengthDiv.style.color = (data.nameLength) ? 'white' : 'red';
                        passwordLengthDiv.style.color = (data.passwordLength) ? 'white' : 'red';
                        passwordNumberDiv.style.color = (data.passwordNumber) ? 'white' : 'red';
                        passwordCapitalDiv.style.color = (data.passwordCapital) ? 'white' : 'red';
                        passwordSpecialDiv.style.color = (data.passwordSpecial) ? 'white' : 'red';
                        noSpaceDiv.style.color = (data.noSpace) ? 'red' : 'white';

                        const colorArray = [
                            usernameUniqueDiv.style.color, usernameLengthDiv.style.color, usernameAdminDiv.style.color,
                            emailLengthDiv.style.color, emailVerifyDiv.style.color, nameLengthDiv.style.color, 
                            passwordLengthDiv.style.color, passwordNumberDiv.style.color, passwordCapitalDiv.style.color,
                            passwordSpecialDiv.style.color, noSpaceDiv.style.color
                        ];
                        registerPageConditionsIndex = 0;
                        for(let i = 0; i < colorArray.length; i++) {
                            if(colorArray[i] === 'white') {
                                registerPageConditionsIndex++;
                            }
                            else {
                                break;
                            }
                        }
                        registerPageHeight = registerPageHeightList[registerPageConditionsIndex];
                        document.getElementById('container').style.height = registerPageHeight;
                        for(let i = 0; i <= Math.min(registerPageConditionsIndex, conditionListIds.length - 1); i++) {
                            document.getElementById(conditionListIds[i]).style.display = 'block';
                        }
                        for(let i = registerPageConditionsIndex + 1; i < conditionListIds.length; i++) {
                            document.getElementById(conditionListIds[i]).style.display = 'none';
                        }
                    }
                })
                .catch(error => console.error(error));
        }
    }

    function changeDisplay() {
        loginFormId.style.display = loginFormId.style.display === 'block' ? 'none' : 'block';
        registerFormId.style.display = registerFormId.style.display === 'block' ? 'none' : 'block';
        loginSwitchFormId.style.display = loginSwitchFormId.style.display === 'block' ? 'none' : 'block';
        registerSwitchFormId.style.display = registerSwitchFormId.style.display === 'block' ? 'none' : 'block';

        if(registerFormId.style.display === 'block') {
            registerPageConditionsIndex = 0;
            for(let i = 0; i <= Math.min(registerPageConditionsIndex, conditionListIds.length - 1); i++) {
                document.getElementById(conditionListIds[i]).style.display = 'block';
            }
            for(let i = registerPageConditionsIndex + 1; i < conditionListIds.length; i++) {
                document.getElementById(conditionListIds[i]).style.display = 'none';
            }
        }
    }

    function changeContainer() {
        document.getElementById('card').style.transform = (document.getElementById('card').style.transform) === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';
        document.getElementById('card').style.transition = 'transform 1s ease';

        document.getElementById('container').style.height = document.getElementById('container').style.height === registerPageHeight ? loginPageWithoutErrorHeight : registerPageHeight;

        document.getElementById('back').style.display = document.getElementById('back').style.display === 'block' ? 'none' : 'block';
        document.getElementById('front').style.display = document.getElementById('front').style.display === 'block' ? 'none' : 'block';
    }

    function switchForm() {
        changeContainer();
        if(registerFormId.style.display === 'block') {
            changeRegisterColor('white');
        }
        changeDisplay();

        if(registerFormId.style.display === 'none' && document.getElementById('register-password').type === 'text') {
            togglePasswordVisibility('register-password', 'toggleRegisterPassword');
        }
        if(registerFormId.style.display === 'none') {
            document.getElementById('registerForm').reset();
        }
        if(loginFormId.style.display === 'none' && document.getElementById('login-password').type === 'text') {
            togglePasswordVisibility('login-password', 'toggleLoginPassword');
        }
        if(loginFormId.style.display === 'none') {
            document.getElementById('loginForm').reset();
        }

        if(errorMessageShown) {
            errorMessageShown = false;
            let errorDiv = document.getElementById('invalid-username');
            errorDiv.style.display = 'none';
        }
    }
    
    function togglePasswordVisibility(passwordId, toggleId) {
        const passwordInput = document.getElementById(passwordId);
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        const togglePassword = document.getElementById(toggleId);
        if(togglePassword.classList.contains('toggle-password-dynamic')) {
            togglePassword.classList.remove('toggle-password-dynamic');
        }
        else {
            togglePassword.classList.add('toggle-password-dynamic');
        }
    }    
});
