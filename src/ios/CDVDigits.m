#import "CDVDigits.h"

#import <Cordova/CDV.h>
#import <DigitsKit/DigitsKit.h>
#import <Fabric/Fabric.h>

@implementation CDVDigits

- (void)pluginInitialize {
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(finishLaunching:) name:UIApplicationDidFinishLaunchingNotification object:nil];
}

- (void)finishLaunching:(NSNotification *)notification {
  [Fabric with:@[[Digits class]]];
}

- (void)authenticate:(CDVInvokedUrlCommand*)command {
  [[Digits sharedInstance] authenticateWithCompletion:^(DGTSession* session, NSError *error) {
    CDVPluginResult* pluginResult = nil;

    if (session) {
      Digits *digits = [Digits sharedInstance];
      DGTOAuthSigning *oauthSigning = [[DGTOAuthSigning alloc] initWithAuthConfig:digits.authConfig authSession:digits.session];
      NSDictionary *authHeaders = [oauthSigning OAuthEchoHeadersToVerifyCredentials];

      NSError *error;
      NSData *jsonData = [NSJSONSerialization dataWithJSONObject:authHeaders
                                                         options:NSJSONWritingPrettyPrinted
                                                           error:&error];
      NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];

      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                       messageAsString:jsonString];
    } else {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                       messageAsString:[error localizedDescription]];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}

@end
