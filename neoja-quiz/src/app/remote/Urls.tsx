const BASEURL = 'http://localhost:3000/api/'

const urls = {
    REGISTER_USER : BASEURL + 'auth/register',
    CHECK_DEVICE : BASEURL + 'auth/check-device',
    ADMIN_LOGIN: BASEURL + 'admin/login',
    ADMIN_SETUP: BASEURL + 'admin/setup'
}

export default urls;