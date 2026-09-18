import { Injectable } from '@angular/core';
import { Response } from '../Models/Response'
import { TrenitaliaResponse } from '../Models/TrenitaliaResponse';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpRequestsService {

    public static jwtToken: string | undefined;
    private apiUrl: string = `${environment.apiBaseUrl}/`;

    public async apiGet<T>(apiEndpoint: string): Promise<Response<T>> {
        const apiResponse = new Response<T>();
        try {
            const response = await fetch(this.apiUrl + apiEndpoint,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${HttpRequestsService.jwtToken}`
                    }
                });

            if (!response.ok) {
                throw new Error(`Error on get call ${apiEndpoint}: ${response.status}`);
            }

            // Il backend (proxy passthrough) ritorna il body così com'è, non incapsulato in
            // Response<T>: lo normalizziamo qui come già fa apiGenericPost per le altre verb.
            const data = await response.json();
            apiResponse.result = true;
            apiResponse.body = (Array.isArray(data) ? data : [data]) as T[];
            return apiResponse;
        } catch (error) {
            apiResponse.result = false;

            if (error instanceof Error) {
                console.error(`Error ${error.message}`)
                apiResponse.notes = error.message;
            } else {
                console.error(`Unexpected error: `, error)
                apiResponse.notes = 'Unexpected error';
            }
            return apiResponse;
        }
    }

    public async apiPost<T>(url: string, body: object): Promise<Response<T>> {
        const response: Response<T> = await this.apiGenericPost(url, body, "POST");
        response.result = true;
        return response;
    }

    public async apiPut<T>(url: string, body: object): Promise<Response<T>> {
        return await this.apiGenericPost(url, body, "PUT");
    }

    public async apiDelete<T>(url: string, body: object): Promise<Response<T>> {
        return await this.apiGenericPost(url, body, "DELETE");
    }

    private async apiGenericPost<T>(url: string, body: object, type: string): Promise<Response<T>> {
        let apiResponse = new Response<T>();
        try {
            const response = await fetch(url,
                {
                    method: type,
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

            if (!response.ok) {
                throw new Error(`Error on post call: ${response.statusText} ${response.status}`);
            }

            if (response.status != 204) {
                const data = await response.json();
                apiResponse.result = true
                const result = [data] as T[];
                apiResponse.body = result;
                return apiResponse;
            }

            apiResponse.result = true;
        } catch (error) {
            apiResponse.result = false;

            if (error instanceof Error) {
                console.error(`Error ${error.message}`)
                apiResponse.notes = error.message;
            } else {
                console.error(`Unexpected error: `, error)
                apiResponse.notes = 'Unexpected error';
            }
        }
        return apiResponse;
    }
}
