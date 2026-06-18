import { ReportModel, IReport } from '../models/report';

const createReport = async (data: Partial<IReport>) => {
  const report = new ReportModel({
    ...data
  });
  return await report.save();
};

const updateReport = async (reportId: string, data: Partial<IReport>) => {
  const report = await ReportModel.findById(reportId);

  if (report) {
    report.set(data);
    return await report.save();
  }

  return null;
};

const getAllReports = async (skip: number, limit: number): Promise<{ reports: IReport[]; total: number }> => {
  const [reports, total] = await Promise.all([
    ReportModel.find().populate('restaurantId', 'profile.name').populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    ReportModel.countDocuments()
  ]);
  return { reports, total };
};

const deleteReport = async (reportId: string) => {
  return await ReportModel.findByIdAndDelete(reportId);
};

export default { createReport, getAllReports, updateReport, deleteReport };
