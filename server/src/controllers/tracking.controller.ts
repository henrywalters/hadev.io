import {Body, Controller, Header, Headers, Ip, Param, Post} from "@nestjs/common";
import {ApiResponse, ResponseDto} from "../dtos/response.dto";
import {PageVisit} from "../entities/pageVisit.entity";

const axios = require('axios').default;

interface PageVisitRequest {
    page: string;
    source?: string;
}

@Controller("v1/tracking")
export class TrackingController {
    @Post("page-visit")
    public async track(@Headers("x-forwarded-for") ip: string, @Body() req: PageVisitRequest): Promise<ApiResponse<void, string>> {
        try {
            const pageVisit = new PageVisit();
            const location = (await axios.get(process.env.LOCATION_API + "?ip=" + ip)).data;
            pageVisit.page = req.page;
            if (req.source) pageVisit.source = req.source;
            pageVisit.ip = ip;
            pageVisit.country = location.country;
            pageVisit.state = location.region;
            pageVisit.city = location.city;
            await pageVisit.save();
            return ResponseDto.Success(void 0);
        } catch (e) {
            console.log(e);
            return ResponseDto.Error(e.message);
        }
    }
}