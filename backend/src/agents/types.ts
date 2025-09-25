export interface AgentExecuteParams<T> {
  input: T;
}

export interface IAgent<T, U> {
  execute(params: AgentExecuteParams<T>): Promise<U>;
}