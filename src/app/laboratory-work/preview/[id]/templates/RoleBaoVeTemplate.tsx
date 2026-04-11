import { ITestCategory, ITestingDevice, ITestJob } from "@/interface/testing";
interface TemplateProps {
  job: ITestJob;
  device: ITestingDevice | undefined;
  categories: ITestCategory[];
  renderResults: (category: ITestCategory, index?: string | number) => JSX.Element | null;
}
export const RoleBaoVeTemplate = ({ job, device, categories, renderResults }: TemplateProps) => {
  return (
    <div className="a4-page shadow-2xl print:shadow-none print:m-0" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
    </div>
  );
};
