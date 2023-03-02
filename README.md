# ocr-Bill-App

## Debugs
### Debugs #1 - Login
**Comportements attendus:** Si un administrateur remplit correctement les champs du Login, il devrait naviguer sur la page Dashboard

**Solution:** Le selector prenait l'input "testid" de l'employé et non de l'admin

containers/Login.js

```javascript
handleSubmitAdmin = e => {
    e.preventDefault()
    const user = {
        type: "Admin",
        email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
        password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
        status: "connected"
    }
}
```