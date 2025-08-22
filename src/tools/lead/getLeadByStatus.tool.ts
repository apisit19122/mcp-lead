import z from "zod";
import { BaseTool, ToolResponse } from "../base-tool.js";
import { GraphQLClient } from "graphql-request";
import { leadMcpToday } from "./graphql/leadMcpToday.js";
import { leadMcpStatusSearch } from "./graphql/leadMcpStatusSearch.js";

export const GetLeadByStatusToolSchema = z.object({
  status: z.array(z.string()),
});

export type GetLeadByStatusToolArgs = z.infer<typeof GetLeadByStatusToolSchema>;

export class GetLeadByStatusTool extends BaseTool<GetLeadByStatusToolArgs> {
  readonly name = "get-lead-by-status";
  readonly description = "ส่งกลับรายการ lead ตามสถานะ";
  readonly inputSchema = {
    type: "object" as const,
    properties: {
      status: {
        type: "array",
        items: { type: "string" },
        description: "สถานะของ lead ที่ต้องการค้นหา สามารถระบุหลายสถานะได้",
      },
    },
    required: ["status"],
  };

  protected zodSchema =
    GetLeadByStatusToolSchema as z.ZodType<GetLeadByStatusToolArgs>;

  private readonly graphqlClient = new GraphQLClient(
    "http://localhost:4000/graphql",
    {
      headers: {
        "x-user": "735c2963-c80c-4981-801d-0a7f293dc859",
        "x-token": "condo",
      },
    }
  );

  async execute(args: GetLeadByStatusToolArgs): Promise<ToolResponse> {
    try {
      const result: any = await this.graphqlClient.request(leadMcpStatusSearch, {
        status: args.status,
      });

      const leadResult = result?.leadMcpStatusSearch?.map((lead: any) => {
        return {
          ...lead,
          fullName: `${lead.firstNameThai} ${lead.lastNameThai}`,
          projectName: lead.interestedProject,
          phone: lead.phoneNumber,
          saleNo: lead.owner ?? null,
          saleName: lead.leadOwner
            ? `${lead.leadOwner.firstName} ${lead.leadOwner.lastName}`
            : null,
        };
      });

      return this.createResponse(JSON.stringify(leadResult));
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการเรียก GraphQL API:", error);

      return this.createResponse(
        `เกิดข้อผิดพลาดในการเรียก GraphQL API: ${
          error instanceof Error ? error.message : "ไม่ทราบสาเหตุ"
        }`
      );
    }
  }
}
