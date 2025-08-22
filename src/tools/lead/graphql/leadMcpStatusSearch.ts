import { gql } from "graphql-request";

export const leadMcpStatusSearch = gql`
  query LeadMcpStatusSearch($status: [String!]!) {
  leadMcpStatusSearch(status: $status) {
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
`;