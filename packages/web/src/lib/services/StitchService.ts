interface StitchService {
  callFunction(name: string, args: any[]): Promise<any>;
}

export default StitchService;
