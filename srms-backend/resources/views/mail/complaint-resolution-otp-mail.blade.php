<x-mail::message>
# Complaint Resolution Confirmation

Hi,

Your complaint **#{{ $complaintNumber }}** has been resolved by the engineer.

Please use the OTP below to confirm that your complaint has been satisfactorily resolved:

@component('mail::panel')
**{{ $otp }}**
@endcomponent

This OTP is valid for **10 minutes** and can be used only once.

- Share this OTP with the engineer to close the complaint.
- If your complaint has **not** been resolved, do **not** share this OTP and contact support.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
