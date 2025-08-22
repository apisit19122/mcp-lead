import z from "zod";
import { BaseTool, ToolResponse } from "../base-tool.js";
import { GraphQLClient } from "graphql-request";
import { leadMcpToday } from "./graphql/leadMcpToday.js";

export const GetLeadToDayToolSchema = z.object({});

export type GetLeadToDayToolArgs = z.infer<typeof GetLeadToDayToolSchema>;

export class GetLeadToDayTool extends BaseTool<GetLeadToDayToolArgs> {
  readonly name = "get-lead-to-day";
  readonly description = "ส่งกลับรายการ lead ของวันนี้";
  readonly inputSchema = {
    type: "object" as const,
    properties: {},
    required: [],
  };

  protected zodSchema =
    GetLeadToDayToolSchema as z.ZodType<GetLeadToDayToolArgs>;

  private readonly graphqlClient = new GraphQLClient(
    "http://localhost:4000/graphql",
    {
      headers: {
        "x-user": "735c2963-c80c-4981-801d-0a7f293dc859",
        "x-token": "condo",
      },
    }
  );

  async execute(args: GetLeadToDayToolArgs): Promise<ToolResponse> {
    try {
      const result: any = await this.graphqlClient.request(leadMcpToday);

      const leadResult = result?.leadMcpToday?.map((lead: any) => {
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
