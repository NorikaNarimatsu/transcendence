import apiCentral from "./apiCentral";
import type { ApiResponse } from "./apiCentral";

interface LanguageResponse {
    success: boolean;
    lang: string;
}

interface UpdateLanguageResponse {
    success: boolean;
    message: string;
    lang: string;
}

export const getUserLanguage = async (userID: number): Promise<string> => {
    const response: ApiResponse<LanguageResponse> = await apiCentral.get(`/api/user/language?userID=${userID}`);
    if (response.error || !response.data){
        throw new Error(response.error || 'Failed to get language');
    }
    return response.data.lang;
};

export const updateUserLanguage = async (userID: number, lang:string): Promise<void> => {
    const response: ApiResponse<UpdateLanguageResponse> = await apiCentral.put(`/api/user/language`, { userID, lang});
    if(response.error){
        throw new Error(response.error || 'Failed to update language');
    }
};