package com.cospark.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminMetricsResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalIdeas;
    private long pendingRequests;
    private long openReports;
    private long proUsers;
}
