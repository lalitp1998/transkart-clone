var admin = require("firebase-admin");
const serviceAccount = {
    "type": "service_account",
    "project_id": "transkart-58a52",
    "private_key_id": "ef6ca7dba1ebb88b5aed686d5ac4752da3c70418",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7bdhsfJyWL+2X\n4wAmouZ0CmOwmqvQRzjtRumBNjCLifkN3kqCxFx+SWj/fjqtIRUjQcXopBsn0Xi/\neoEisJefiOQ5XGcrM6shSxBsLl7rB5JFDf7zLZsySdHv0wrhI5r3RW5kv+kOuXXR\nguH576e3k7oFm86YgZbxOKRA1HVqM0ReV6S3xLlvh8kVRt4YwVMBXxXKRTyoISCb\nbHd3W5Z88wPoJasNLp7I6DfpPZeWMGj2nC+nbPRlFcqwPGNyf73a73rbFEH9wWCk\naRxFkqCEnyNcsQ/YMXWMz3PwhOkaDc15XQ20SaMNyPevqYP7rYMwRBhSfiz9BNOP\nS5Z3UdFlAgMBAAECggEAE8E2o+yYZn4DuVQMMoZN6uIjcrxCqq+vENc+CkfnYvW2\nYd9RlCnVI9xh7DfmQFQx0ab/kI8na5F4/BmR3dGmEYMQpvkVyKhn+5jZUMWsbHI+\nWPfqLMBcULcWIQRp66Pgk/pl8cmGa25hvCTi44B+eWthGnE7G7jg62jQayLZg0lY\nw3wIcZTUOd/xtzhbPcfMK5Vz4fGoGMqOKVS9xW697uwy8KdMgR87+X0AY5wMNt4Y\nC3WwfntwGcc3lx7E6uzjvl/qhxVYBRjGWOacRK3oJN+MJLyYATZgn7lBsRKGbQHG\nSutsvcxrSLXnUj8eolIsg07obHmQxQg0NziJOxnSYQKBgQDordueLmyVLrGB8wqF\nKHuVjh20snuInNkDN2Sn16pGeGUHfsUE8P2oeSOIHTz6/iep0o0jWGW2RmOh2Mwh\nii3ajMF5znduDmpnN5BwO1byFmvHEXB9Uv+nNEmp06y+nacGsAsmzkRDsxx4PIh3\nkXO8lTjGHdTtqV8CNA3DX07UEQKBgQDONvMuChpsYqFoIW+ttf4HTIpanG2pDq+J\nJnm7tyuekBXDwCW7+qkcYjnEeQ/U8tKVwpRI4PpJZaNEDOxH/zGZ85imtnM9zWY6\nIKG0PQAcshIwrlOTZf5QzB7t64uGBp0Y2eWQ8gXZ6SFGwlS8FkoNQ28/ecMWpgRj\ngokY/G+sFQKBgC/b0thuZBcrS4eXHgrVkNXqLWIFdDNdT6XBtwpu6a8lBGLOSGgD\nyajlgdF1ch2OOUpM7Irgm8sqH0Qi+5nKejQBz6nmNdqFTI1+eE8dZXzV78U6aRDe\nCYey0ZQE3fs3IivV+fU5aAEkzi5NBSTS3iNj7hGSAUIBHHGvk0UkTWqBAoGAcQLU\nSorm6Dc1VafdWEnAqadcu0O3JUsTEAqx9BnyIbe89cY758T7IL8EAZSHBKD+n2w/\nb6E8CTVWQFkEtIA6YrCJG/QpO9lxCLIRbIFxqkg8h8lBrCndMdJrsN/BWvYM6i2g\nDctVQZLt1aVyYpGki5hFQ3grXiIljZNgJv1RBfECgYAIdocFebQp+d1jzB37eyL/\n3X8as7lglUda1OouPGQHsoFOGJTq55KMU8oYRg7g+NfH9mk7i1dnRMrxizG9mwEs\nq38m4G/TUtjtdP3SMwV4DrlNvu6iqx9engHAPl/ZRPSVCr1ymlVnM4Sgbj55r6Rm\nefJDZLAB8BBANuhIDFZWjg==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-o20qh@transkart-58a52.iam.gserviceaccount.com",
    "client_id": "105627589555604831464",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-o20qh%40transkart-58a52.iam.gserviceaccount.com"

}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
module.exports = admin