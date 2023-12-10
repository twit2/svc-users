import { GenericPagedOp } from "@twit2/std-library";

export interface UserGetProfileListOp extends GenericPagedOp {
    filter: "latest"|"verified"|"unverified";
}