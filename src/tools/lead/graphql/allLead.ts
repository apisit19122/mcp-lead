import { gql } from "graphql-request";

export const allLead = gql`
  query AllLeadPagination(
    $limit: Float
    $page: Float
    $search: String
    $status: [String]
    $projectId: String
    $projectIds: [String]
    $owner: String
    $createdAt: [DateTime]
    $contactDate: [DateTime]
    $statusOwner: String
    $grade: [String]
    $media: [String]
    $regnchannel: [String]
    $leadSource: String
    $projectStatus: String
  ) {
    allLeadPagination(
      limit: $limit
      page: $page
      search: $search
      status: $status
      projectId: $projectId
      projectIds: $projectIds
      owner: $owner
      createdAt: $createdAt
      contactDate: $contactDate
      statusOwner: $statusOwner
      grade: $grade
      media: $media
      regnchannel: $regnchannel
      leadSource: $leadSource
      projectStatus: $projectStatus
    ) {
      totalCount
      edges {
        cursor
        node {
          id
          leadNo
          firstNameThai
          lastNameThai
          phoneNumber
          phoneNumber2
          email
          lineId
          status
          projectId
          interestedProject
          owner
          contactDate
          createdAt
          leadSource
          media
          utmSource
          registrationChannel
          leadOwner {
            id
            firstName
            lastName
            isDelete
          }
          leadComment {
            id
            description
            createdAt
          }
          activity {
            id
            objective
            result1
            result2
            leadStatus
            opportunityStage
            contactChannels
            dueDate
            note
            createdAt
            updatedAt
          }
          activityLast {
            id
            objective
            result1
            result2
            leadStatus
            opportunityStage
            contactChannels
            dueDate
            note
            createdAt
            updatedAt
          }
          activityApprove {
            id
            leadId
            cbuId
            status
            createdBy
          }
          opportunitys {
            id
            gradeCustomer
            gradeCustomerInterest
            bookingId
            opportunityUnit {
              id
              unit
            }
            activity {
              id
              createdAt
            }
          }
          campaignLead {
            id
            campaignName
            campaignNo
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
