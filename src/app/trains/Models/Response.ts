export class Response<T> {
  /** Boolean value that specifies if the request was succesfull or not */
  public result: boolean = false;
  /** Data contained by the request */
  public body: T[] = [];
  /** Errors produced by the response */
  public notes: string | null = null;
}
