# cordova-plugin-digits

This plugin provides native mobile Digits.com integration for both Android and iOS.

## Installation

This requires cordova 3.0+ (current stable 1.0.0)

    cordova plugin add cordova-plugin-digits --variable FABRIC_API_KEY=your_api_key --variable FABRIC_CONSUMER_KEY=your_consumer_key --variable FABRIC_CONSUMER_SECRET=your_consumer_secret

It is also possible to install via repo url directly (unstable)

    cordova plugin add https://github.com/JimmyMakesThings/cordova-plugin-digits --variable FABRIC_API_KEY=your_api_key --variable FABRIC_CONSUMER_KEY=your_consumer_key --variable FABRIC_CONSUMER_SECRET=your_consumer_secret

## Supported Platforms

 - iOS
 - Android

## Methods

 - window.plugins.digits.authenticate

### window.plugins.digits.authenticate

Initiates the Digits native interface. If successful the `authenticateSuccess` is called,
otherwise the `authenticateFailed` is called instead.

    window.plugins.digits.authenticate(authenticateSuccess, authenticateFailed);

#### Parameters

 - **authenticateSuccess**: The callback that is passed the authenticated info.
 - **geolocationError**: (Optional) The callback that executes if authentication fails.

#### Example

    window.plugins.cordovaDigits.authenticate((loginResponse) => {
      const oAuthHeaders = JSON.parse(loginResponse);
    }, (error) => {
      console.warn("[Digits]", "Login failed", error);
    });

## Contributiors

This plugin is based off the work of another plugin: [https://github.com/cosmith/cordova-digits](https://github.com/cosmith/cordova-digits).
