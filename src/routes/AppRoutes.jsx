import { Route, Routes } from "react-router-dom";

import AuthRoute from "./AuthRoute";
import Login from "@/app/auth/Login";
import ForgotPassword from "@/components/ForgotPassword/ForgotPassword";
import Maintenance from "@/components/common/Maintenance";
import ProtectedRoute from "./ProtectedRoute";

import NotFound from "@/app/errors/NotFound";
import Home from "@/app/home/Home";
import UserList from "@/app/enquiry/user/UserList";
import PendingList from "@/app/enquiry/pending/PendingList";
import CancelList from "@/app/enquiry/cancel/CancelList";
import CompanyUserView from "@/app/companyList/companyUserView/CompanyUserView";
import CompanyListSuper from "@/app/companyList/companyListSuper/CompanyListSuper";
import CompanyStatusList from "@/app/companyStatus/CompanyStatusList";
import UploadDataList from "@/app/uploadData/UploadDataList";
import CompanySuperView from "@/app/companyList/companyListSuper/CompanySuperView";
import SignUp from "@/app/auth/SignUp";
import Download from "@/app/download/Download";
import PendingFollowUp from "@/app/PendingFollowUp/PendingFollowUp";
import CategoryList from "@/app/category/CategoryList";
import TemplateList from "@/app/Template/TemplateList";
import CampaignList from "@/app/Campaign/CampaignList";
import Pipeline from "@/app/Pipeline/Pipeline";
import AddPipleline from "@/app/Pipeline/AddPipleline";
import EditPipeline from "@/app/Pipeline/EditPipeline";
import DefaultCampaignList from "@/app/DefaultCammpaign/DefaultCampaignList";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/add-pipeline" element={<AddPipleline />} />
        <Route path="/Campaign-list" element={<CampaignList />} />
        <Route path="/default-campaign-list" element={<DefaultCampaignList/>} />
        {/* enquiry list  */}

        <Route path="/enquiry/pending" element={<PendingList />} />
        <Route path="/enquiry/cancel" element={<CancelList />} />
        <Route path="/enquiry/user" element={<UserList />} />
        {/* company list super  */}
        <Route path="/company-list" element={<CompanyListSuper />} />
        <Route path="/company-list/view/:id" element={<CompanySuperView />} />
        {/* company list user  */}
        <Route path="/company-list-user" element={<CompanyUserView />} />
        <Route path="/Template-list" element={<TemplateList />} />
        <Route path="/category-list" element={<CategoryList />} />
        <Route path="/Pipeline-list" element={<Pipeline />} />
        <Route path="/edit-pipeline/:id" element={<EditPipeline />} />

        {/* company status  */}
        <Route path="/company-status" element={<CompanyStatusList />} />
        {/* upload data  */}
        <Route path="/upload-data" element={<UploadDataList />} />
        <Route path="/pending-followup" element={<PendingFollowUp />} />
        {/* download  */}
        <Route path="/download" element={<Download />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
