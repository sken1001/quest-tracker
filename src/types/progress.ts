export type ProgressState = '未所持' | '所持' | '1段階目' | '2段階目' | '3段階目（完了）';

export interface ProgressItem {
  id: string;
  name: string;
  type: string;
  progress: ProgressState;
  completed: boolean;
}
