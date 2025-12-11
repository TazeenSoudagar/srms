<x-mail::message>
# SRMS – Login OTP

Hi,

Your one-time password (OTP) for logging into **SRMS** is:

@component('mail::panel')
**{{ $otp }}**
@endcomponent

This OTP is valid for a short time and can be used only once.

- Do **not** share this code with anyone.
- If you did not request this OTP, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}<br>
{{ config('app.url') }}
</x-mail::message>
