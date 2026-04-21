<x-mail::message>
# Service Completion Confirmation

Hi,

Your service request **#{{ $requestNumber }}** has been marked as completed by the engineer.

Please use the OTP below to confirm that the service was completed to your satisfaction:

@component('mail::panel')
**{{ $otp }}**
@endcomponent

This OTP is valid for **10 minutes** and can be used only once.

- Enter this OTP in the app to confirm completion and close the request.
- If the service was **not** completed, do **not** enter this OTP and contact support.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
