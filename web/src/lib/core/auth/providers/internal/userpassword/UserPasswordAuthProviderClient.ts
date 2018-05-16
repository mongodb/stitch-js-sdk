import { UserPassCredential } from "stitch-core";

export default interface UserPasswordAuthProviderClient {

    /** Gets a credential for a user from the given username and password. */
    getCredential(
        username: string, password: string): UserPassCredential
  
    /**                                                                                                                                                                                                               
     * Registers a new user with the given email and password.                                                                                                                                                        
     *                                                                                                                                                                                                                
     * @return A {@link Promise} that completes when registration completes/fails.                                                                                                                                       
     */
    registerWithEmail(email: string, password: string): Promise<void>
  
    /**                                                                                                                                                                                                               
     * Confirms a user with the given token and token id.                                                                                                                                                             
     *                                                                                                                                                                                                                
     * @return A {@link Promise} that completes when confirmation completes/fails.                                                                                                                                       
     */
    confirmUser(token: string, tokenId: string): Promise<void>
  
    /**                                                                                                                                                                                                               
     * Resend the confirmation for a user to the given email.                                                                                                                                                         
     *                                                                                                                                                                                                                
     * @return A {@link Promise} that completes when the resend request completes/fails.                                                                                                                                 
     */
    resendConfirmationEmail(email: string): Promise<void>
  
    /**                                                                                                                                                                                                               
     * Reset the password of a user with the given token, token id, and new password.                                                                                                                                 
     *                                                                                                                                                                                                                
     * @return A {@link Promise} that completes when the password reset completes/fails.                                                                                                                                 
     */
    resetPassword(
        token: string, tokenId: string, password: string): Promise<void>
  
    /**                                                                                                                                                                                                               
     * Sends a user a password reset email for the given email.                                                                                                                                                       
     *                                                                                                                                                                                                                
     * @return A {@link Promise} that completes when the reqest request completes/fails.                                                                                                                                 
     */
    sendResetPasswordEmail(email: string): Promise<void>
  }
