import z from "zod";
import { BaseTool, ToolResponse } from "../base-tool.js";
import { GraphQLClient } from "graphql-request";
import { allLead } from "./graphql/allLead.js";

export const GetCountLeadTodayToolSchema = z.object({
  $search: z.string().optional(),
});

export type GetCountLeadTodayToolArgs = z.infer<
  typeof GetCountLeadTodayToolSchema
>;

export class GetCountLeadTodayTool extends BaseTool<GetCountLeadTodayToolArgs> {
  readonly name = "get-all-lead";
  readonly description = "ส่งกลับรายการ lead";
  readonly inputSchema = {
    type: "object" as const,
    properties: {
      $search: {
        type: "string",
        description: "ค้นหา lead",
      },
    },
    required: ["$search"],
  };

  protected zodSchema =
    GetCountLeadTodayToolSchema as z.ZodType<GetCountLeadTodayToolArgs>;

  private readonly graphqlClient = new GraphQLClient(
    "http://localhost:4000/graphql",
    {
      headers: {
        "x-user": "735c2963-c80c-4981-801d-0a7f293dc859",
        "x-token": "condo",
      },
    }
  );

  async execute(args: GetCountLeadTodayToolArgs): Promise<ToolResponse> {
    try {
      const { $search } = args;

      const result: any = await this.graphqlClient.request(allLead, {
        search: $search,
      });

      const leadResult = result?.allLeadPagination?.edges?.map((edge: any) => {
        const lead = edge?.node;
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
