<x-mail::message>
# Welcome to SRMS!

Hi **{{ $user->first_name }} {{ $user->last_name }}**,

Welcome to the **Service Request Management System (SRMS)**! Your account has been successfully created.

## Your Login Credentials

@component('mail::panel')
**Email:** {{ $user->email }}<br>
**Password:** {{ $password }}
@endcomponent

@component('mail::button', ['url' => $loginUrl])
Login to SRMS
@endcomponent

## Important Security Notice

⚠️ **This is an auto-generated password. For your security, please change your password immediately after your first login.**

### How to Change Your Password:
1. Log in using the credentials above
2. Navigate to your profile settings
3. Update your password to something secure and memorable

## Need Help?

If you have any questions or need assistance, please contact your system administrator.

---

**Security Tips:**
- Do **not** share your password with anyone
- Use a strong, unique password
- Keep your login credentials secure

Thanks,<br>
{{ config('app.name') }} Team<br>
{{ config('app.url') }}
</x-mail::message>
